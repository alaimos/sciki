<?php

namespace App\Modules\Simulations\Services;

use App\Exceptions\FileSystemException;
use App\Modules\Simulations\Models\Simulation;
use App\Services\Utils;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use InvalidArgumentException;
use JsonException;
use League\Csv\CannotInsertRecord;
use League\Csv\InvalidArgument;
use League\Csv\Reader;
use League\Csv\Statement;
use League\Csv\Writer;

class CorrelationService
{

    private const CSV_DATA_FILE = '/data.tsv';
    private const CORRELATION_OUTPUT_FILE = '/correlation.tsv';
    private const JSON_OUTPUT_FILE = '/correlation.json';

    private Simulation $simulation;
    private string $id;
    private string $function;
    private bool $top;
    private int $n;
    private string $direction;
    private bool $useEndpoints;
    private bool $usePerturbation;
    private array $findByTags;
    private string $searchMode;
    private string $directory;

    public function __construct(Simulation $simulation, array $data)
    {
        $this->simulation = $simulation;
        $this->function = $data['function'] ?? 'pearson';
        $this->top = (bool)($data['top'] ?? false);
        $this->n = (int)($data['n'] ?? 10);
        $this->direction = $data['direction'] ?? 'negative';
        $this->useEndpoints = (bool)($data['useEndpoints'] ?? true);
        $this->usePerturbation = (bool)($data['usePerturbation'] ?? false);
        $this->findByTags = $data['findByTags'] ?? [];
        $this->searchMode = $data['mode'] ?? 'all';
        $this->computeId();
    }

    private function computeId(): void
    {
        /** @noinspection JsonEncodingApiUsageInspection */
        $this->id = md5(
            json_encode(
                [
                    $this->simulation->id,
                    $this->function,
                    $this->useEndpoints,
                    $this->usePerturbation,
                    collect($this->findByTags)->map(fn($t) => strtolower($t))->sort()->toArray(),
                    $this->searchMode
                ]
            )
        );
    }

    /**
     * @throws FileSystemException
     */
    private function makeDirectory(): void
    {
        $this->directory = $this->simulation->fileAbsolutePath('correlations/' . $this->id);
        Utils::createDirectory($this->directory);
    }

    /**
     * @param Simulation $s
     * @return Collection
     * @throws FileSystemException
     * @throws JsonException
     */
    private function prepareSimulationData(Simulation $s): Collection
    {
        $parser = new SimulationParserService($s);
        return $parser->readNodesByPathway()
                      ->flatMap(fn($nodes) => $nodes)
                      ->filter(fn($n) => !$this->useEndpoints || $n['isEndpoint'])
                      ->pluck($this->usePerturbation ? 'perturbation' : 'activity', 'id');
    }

    /**
     * @throws InvalidArgumentException
     */
    private function getSimulationsFromTags(): EloquentCollection
    {
        if (!empty($this->findByTags)) {
            $simulationService = new SimulationService();
            $foundSimulations = $simulationService->findSimulationsByTags(
                $this->findByTags,
                $this->searchMode,
                [$this->simulation->id]
            );
            if ($foundSimulations->count() > 1) {
                return $foundSimulations;
            }
        }
        throw new InvalidArgumentException('Two or more simulations are needed to compute the correlation heatmap.');
    }

    /**
     * @param Collection[] $simulationData
     * @return Collection|string[]
     */
    private function getCommonKeys(Collection $simulationData): Collection
    {
        $keys = $simulationData->first()->keys();
        foreach ($simulationData as $simulation) {
            $keys = $keys->intersect($simulation->keys());
        }
        return $keys->keyBy(fn($item) => $item);
    }

    /**
     * @param EloquentCollection $simulations
     * @return string
     * @throws FileSystemException
     * @throws JsonException
     * @throws CannotInsertRecord
     * @throws InvalidArgument
     */
    private function prepareCSVFile(EloquentCollection $simulations): string
    {
        $outputFile = $this->directory . self::CSV_DATA_FILE;
        $data = $simulations->keyBy('id')
                            ->map(fn($s) => $this->prepareSimulationData($s))
                            ->prepend($this->prepareSimulationData($this->simulation), $this->simulation->id);
        $commonKeys = $this->getCommonKeys($data);
        $data = $data->map(fn($d) => $d->filter(fn($v, $k) => isset($commonKeys[$k])));
        $keys = $data->first()->keys()->toArray();
        $data = $data->map(fn($d, $k) => $d->values()->prepend($k)->toArray());
        $csv = Writer::createFromPath($outputFile, 'w+')
                     ->setDelimiter("\t");
        $csv->insertOne($keys);
        $csv->insertAll($data);
        return $outputFile;
    }

    private function computeCorrelationFile(string $csvFile): string
    {
        $outputFile = $this->directory . self::CORRELATION_OUTPUT_FILE;
        Utils::runCommand(
            [
                config('sciki.rscript_executable'),
                config('modules.simulations.compute_correlation'),
                '-i',
                $csvFile,
                '-c',
                $this->function,
                '-o',
                $outputFile,
            ],
            $this->directory,
            60
        );
        return $outputFile;
    }

    private function prepareCollection(string $correlationFile, string $jsonFile, Collection $simulations): Collection
    {
        $csv = Reader::createFromPath($correlationFile)
                     ->setDelimiter("\t")
                     ->setHeaderOffset(0);
        $reader = Statement::create()->process($csv);
        $map = $simulations->pluck('name', 'id');
        $data = collect(iterator_to_array($reader, false));
        $data->map(
            fn($row) => [
                'id'          => (int)$row['simulation'],
                'name'        => $map[(int)$row['simulation']],
                'correlation' => (double)$row['correlation'],
            ]
        );
        file_put_contents($jsonFile, $data->toJson());
        return $data;
    }

    /**
     * @param $jsonFile
     * @return Collection
     * @throws JsonException
     */
    private function readCollection($jsonFile): Collection
    {
        return collect(json_decode(file_get_contents($jsonFile), true, 512, JSON_THROW_ON_ERROR));
    }

    /**
     * @return array
     * @throws FileSystemException
     * @throws JsonException
     */
    public function makeDataPoints(): array
    {
        $this->makeDirectory();
        $jsonFile = $this->directory . self::JSON_OUTPUT_FILE;
        if (!file_exists($jsonFile)) {
            $simulations = $this->getSimulationsFromTags();
            $csvFile = $this->prepareCSVFile($simulations);
            $correlationFile = $this->computeCorrelationFile($csvFile);
            $data = $this->prepareCollection($correlationFile, $jsonFile, $simulations);
        } else {
            $data = $this->readCollection($jsonFile);
        }
        $data = $data->sortBy('correlation');
        if ($this->top) {
            if ($this->direction === 'negative') {
                $data = $data->take($this->n);
            } else {
                $data = $data->take(-$this->n);
            }
        }
        dd($data);
        return [];
    }
}

/*
(new \App\Modules\Simulations\Services\CorrelationService(Simulation::whereId(10)->first(), ['findByTags' => ['another: test']]))->makeDataPoints()

 */
