<?php


namespace App\Modules\Simulations\Services;


use App\Exceptions\FileSystemException;
use App\Modules\Simulations\Exceptions\SimulationParserException;
use App\Modules\Simulations\Models\Simulation;
use App\Services\Utils;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use JsonException;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Throwable;

class SimulationParserService
{

    public const FIELDS_ALL = [
        'pathwayId',
        'pathwayName',
        'nodeId',
        'nodeName',
        'isEndpoint',
        'isDirectTarget',
        'activityScore',
        'pValue',
        'FDR',
        'LL',
        'pathwayActivityScore',
        'pathwayPValue',
        'pathwayFDR',
        'pathwayLL',
        'targetedBy',
        'averagePerturbation',
        'averagePathwayPerturbation',
    ];

    public const FIELDS_CAST = [
        'pathwayId'                  => null,
        'pathwayName'                => 'pathway',
        'nodeId'                     => null,
        'nodeName'                   => null,
        'isEndpoint'                 => 'boolean',
        'isDirectTarget'             => 'boolean',
        'activityScore'              => 'double',
        'pValue'                     => 'double',
        'FDR'                        => 'double',
        'LL'                         => 'll',
        'pathwayActivityScore'       => 'double',
        'pathwayPValue'              => 'double',
        'pathwayFDR'                 => 'double',
        'pathwayLL'                  => 'll',
        'targetedBy'                 => 'array',
        'averagePerturbation'        => 'double',
        'averagePathwayPerturbation' => 'double',
        'probabilities'              => 'ignore',
    ];
    public const LL = ['activation', 'inhibition', 'other'];

    /**
     * The phensim input file
     *
     * @var string
     */
    private string $phensimFile;

    /**
     * The working directory
     *
     * @var string
     */
    private string $workingDirectory;

    /**
     * Remove the reader cache for a phensim simulation
     *
     * @param string $phensimFile
     *
     * @return void
     */
    public static function cleanupCache(string $phensimFile): void
    {
        $cacheDirectory = dirname($phensimFile) . DIRECTORY_SEPARATOR . 'reader_cache';
        if (is_dir($cacheDirectory) && file_exists($cacheDirectory)) {
            Utils::delete($cacheDirectory);
        }
    }

    /**
     * Reader Constructor
     *
     * @param string|Simulation $phensimFile
     *
     * @throws FileSystemException|JsonException
     */
    public function __construct(string|Simulation $phensimFile)
    {
        if ($phensimFile instanceof Simulation) {
            $phensimFile = $phensimFile->fileAbsolutePath($phensimFile->output_file);
        }
        if (!file_exists($phensimFile)) {
            throw new SimulationParserException('Phensim file does not exist');
        }
        $this->phensimFile = $phensimFile;
        $this->workingDirectory = dirname($phensimFile) . DIRECTORY_SEPARATOR . 'reader_cache';
        Utils::createDirectory($this->workingDirectory);
        $this->initialize();
    }

    /**
     * Initialize the cache by reading all pathways and nodes inside PHENSIM output file
     * and write them to json files
     *
     * @throws JsonException
     */
    private function initialize(): void
    {
        if (!file_exists($this->workingDirectory . DIRECTORY_SEPARATOR . 'pathways.json')) {
            $pathways = [];
            $nodesByPathway = [];
            $pathwaysToNames = [];
            $nodesToNames = [];
            $pathwaysVectors = [
                'activity'     => [],
                'perturbation' => [],
            ];
            $nodesVectors = [
                'activity'     => [],
                'perturbation' => [],
            ];
            $fp = @fopen($this->phensimFile, 'rb');
            if (!$fp) {
                throw new SimulationParserException('Unable to open phensim output file');
            }
            $max = count(self::FIELDS_ALL);
            while (($line = fgets($fp)) !== false) {
                if (!empty($line) && !str_starts_with($line, '#')) {
                    $fields = str_getcsv($line, "\t");
                    $n = count($fields);
                    if ($n === $max) {
                        $fields = $this->prepare($fields);
                        $pId = $fields['pathwayId'];
                        if (!isset($pathways[$pId])) {
                            $pathways[$pId] = [
                                'pathwayId'                  => $pId,
                                'pathwayName'                => $fields['pathwayName'],
                                'pathwayActivityScore'       => $fields['pathwayActivityScore'],
                                'pathwayPValue'              => $fields['pathwayPValue'],
                                'pathwayFDR'                 => $fields['pathwayFDR'],
                                'averagePathwayPerturbation' => $fields['averagePathwayPerturbation'],
                            ];
                            $pathwaysToNames[$pId] = $fields['pathwayName'];
                            $pathwaysVectors['activity'][$pId] = $fields['pathwayActivityScore'];
                            $pathwaysVectors['perturbation'][$pId] = $fields['averagePathwayPerturbation'];
                            $nodesByPathway[$pId] = [];
                        }
                        $nodesByPathway[$pId][] = [
                            'nodeId'              => $fields['nodeId'],
                            'nodeName'            => $fields['nodeName'],
                            'isEndpoint'          => $fields['isEndpoint'],
                            'activityScore'       => $fields['activityScore'],
                            'pValue'              => $fields['pValue'],
                            'FDR'                 => $fields['FDR'],
                            'averagePerturbation' => $fields['averagePerturbation'],
                        ];
                        $nodesToNames[$fields['nodeId']] = $fields['nodeName'];
                        $nodesVectors['activity'][$fields['nodeId']] = $fields['activityScore'];
                        $nodesVectors['perturbation'][$fields['nodeId']] = $fields['averagePerturbation'];
                    }
                }
            }
            @fclose($fp);
            ksort($pathwaysVectors['activity']);
            ksort($pathwaysVectors['perturbation']);
            ksort($nodesVectors['activity']);
            ksort($nodesVectors['perturbation']);
            $this->saveDataToCache('pathways.json', $pathways)
                 ->saveDataToCache('pathways_to_names.json', $pathwaysToNames)
                 ->saveDataToCache('pathways_activity_vector.json', $pathwaysVectors['activity'])
                 ->saveDataToCache('pathways_perturbation_vector.json', $pathwaysVectors['perturbation'])
                 ->saveDataToCache('nodes_to_names.json', $nodesToNames)
                 ->saveDataToCache('nodes_activity_vector.json', $nodesVectors['activity'])
                 ->saveDataToCache('nodes_perturbation_vector.json', $nodesVectors['perturbation']);
            foreach ($nodesByPathway as $pId => $data) {
                $this->saveDataToCache('pathway_' . Str::slug($pId) . '.json', $data);
            }
        }
    }

    /**
     * Sava a data array to the cache in json format
     *
     * @param string $filename
     * @param array $data
     * @return $this
     * @throws JsonException
     */
    private function saveDataToCache(string $filename, array $data): self
    {
        file_put_contents(
            $this->workingDirectory . DIRECTORY_SEPARATOR . $filename,
            json_encode(['data' => $data], JSON_THROW_ON_ERROR)
        );
        return $this;
    }

    /**
     * Modifies a file to use its data for subsequent analysis
     *
     * @param string $field
     * @param string $value
     *
     * @return float|bool|array|string|null
     */
    private function cast(string $field, string $value): float|null|bool|array|string
    {
        if (self::FIELDS_CAST[$field] === 'boolean') {
            return (strtolower($value) === 'yes');
        }
        if (self::FIELDS_CAST[$field] === 'double') {
            return (float)$value;
        }
        if (self::FIELDS_CAST[$field] === 'array') {
            return (empty($value)) ? [] : explode(",", $value);
        }
        if (self::FIELDS_CAST[$field] === 'pathway') {
            return preg_replace('/\s+-\s+enriched/i', '', $value);
        }

        return $value;
    }

    /**
     * Prepares all fields in a line of PHENSIM output file
     *
     * @param array $lineData
     *
     * @return array
     */
    private function prepare(array $lineData): array
    {
        $lineData = array_combine(self::FIELDS_ALL, $lineData);
        foreach ($lineData as $field => $value) {
            $lineData[$field] = $this->cast($field, $value);
        }

        return $lineData;
    }

    /**
     * Read a file from the cache
     *
     * @param string $filename
     * @return Collection
     * @throws JsonException
     */
    public function readCachedFile(string $filename): Collection
    {
        $file = $this->workingDirectory . DIRECTORY_SEPARATOR . $filename;
        if (!file_exists($file)) {
            throw new SimulationParserException(sprintf('File "%s" not found', $filename));
        }
        $data = json_decode(
            file_get_contents($file),
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        return collect($data['data']);
    }

    /**
     * Read list of pathways contained in the simulation
     *
     * @return Collection
     * @throws JsonException
     */
    public function readPathwaysList(): Collection
    {
        return $this->readCachedFile('pathways.json');
    }

    /**
     * Checks if this simulation has results for a specific pathway
     *
     * @param string $pathway
     *
     * @return bool
     */
    public function hasPathway(string $pathway): bool
    {
        return file_exists($this->workingDirectory . DIRECTORY_SEPARATOR . 'pathway_' . Str::slug($pathway) . '.json');
    }

    /**
     * Read the list of altered genes for a single pathway
     *
     * @param string $pathway
     *
     * @return Collection
     * @throws JsonException
     */
    public function readPathway(string $pathway): Collection
    {
        return $this->readCachedFile('pathway_' . Str::slug($pathway) . '.json');
    }

    /**
     * @return Collection
     * @throws JsonException
     */
    public function readPathwaysToNames(): Collection
    {
        return $this->readCachedFile('pathways_to_names.json');
    }

    /**
     * @return Collection
     * @throws JsonException
     */
    public function readNodesToNames(): Collection
    {
        return $this->readCachedFile('nodes_to_names.json');
    }

    /**
     * Builds an image to show the pathway graph
     *
     * @param string $pathway
     * @param string $organism
     *
     * @return string
     * @throws Throwable
     */
    public function makePathwayImage(string $pathway, string $organism): string
    {
        $outputFile = $this->workingDirectory . DIRECTORY_SEPARATOR . 'pathway_' . Str::slug($pathway) . '.png';
        if (!file_exists($outputFile)) {
            $inputFile = $this->workingDirectory . DIRECTORY_SEPARATOR . 'pathway_' . Str::slug($pathway) . '.json';
            if (!file_exists($inputFile)) {
                throw new SimulationParserException(sprintf('Pathway "%s" not found', $pathway));
            }
            try {
                Utils::runCommand(
                    [
                        config('sciki.rscript_executable'),
                        config('modules.simulations.build_graph'),
                        '-i',
                        $inputFile,
                        '-p',
                        $pathway,
                        '-g',
                        $organism,
                        '-o',
                        $outputFile,
                    ],
                    $this->workingDirectory,
                    60
                );
            } catch (ProcessFailedException $e) {
                throw Utils::mapCommandException(
                    $e,
                    [
                        101 => Utils::IGNORED_ERROR_CODE,
                        102 => 'Unable to build intermediate output file.',
                        103 => 'Unable to build output file',
                    ]
                );
            }
        }

        return $outputFile;
    }

}
