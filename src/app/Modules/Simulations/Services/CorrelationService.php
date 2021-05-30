<?php

namespace App\Modules\Simulations\Services;

use App\Exceptions\FileSystemException;
use App\Modules\Simulations\Models\Simulation;
use App\Services\Utils;
use Illuminate\Support\Collection;
use InvalidArgumentException;
use JsonException;

class CorrelationService
{

    private Simulation $simulation;
    private string $id;
    private string $function;
    private bool $top;
    private int $n;
    private bool $bothDirections;
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
        $this->bothDirections = (bool)($data['bothDirections'] ?? false);
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
                    $this->top,
                    $this->n,
                    $this->bothDirections,
                    $this->useEndpoints,
                    $this->usePerturbation,
                    collect($this->findByTags)->sort()->toArray(),
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
     * @return Collection
     * @throws InvalidArgumentException
     */
    private function getSimulationsFromTags(): Collection
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
     * @return array
     * @throws FileSystemException
     * @throws JsonException
     */
    public function makeDataPoints(): array
    {
//        $simulationData = $this->get();
//        $selectedRows = $simulationData->pluck('id')->toArray();
//        $dataFromTags = $this->getFromTags($selectedRows);
//        if ($dataFromTags !== null) {
//            $simulationData = $simulationData->merge($dataFromTags);
//        }
//        $dataFromAttachedSimulations = $this->getFromAttachedSimulations($selectedRows);
//        if ($dataFromAttachedSimulations !== null) {
//            $simulationData = $simulationData->merge($dataFromAttachedSimulations);
//        }
//        $simulationData = $simulationData->map(
//            static function ($item) {
//                return [
//                    'x' => $item['simulation'],
//                    'y' => $item['id'] . ': ' . $item['name'],
//                    'z' => $item['value'],
//                ];
//            }
//        )->groupBy('y');
//        return array_merge(
//            [
//                'x' => $simulationData->first()->pluck('x'),
//                'y' => $simulationData->keys(),
//                'z' => $simulationData->map->pluck('z')->values(),
//            ],
//            $this->computeZRange($simulationData)
//        );
    }
}
