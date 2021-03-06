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

    public const PATHWAYS_FILE = 'pathways.json';
    public const PATHWAYS_TO_NAMES_FILE = 'pathways_to_names.json';
    public const PATHWAYS_ACTIVITY_VECTOR_FILE = 'pathways_activity_vector.json';
    public const PATHWAYS_PERTURBATION_VECTOR_FILE = 'pathways_perturbation_vector.json';
    public const NODES_TO_NAMES_FILE = 'nodes_to_names.json';
    public const NODES_ACTIVITY_VECTOR_FILE = 'nodes_activity_vector.json';
    public const NODES_PERTURBATION_VECTOR_FILE = 'nodes_perturbation_vector.json';
    public const NODES_BY_PATHWAY_FILE = 'nodes_by_pathway.json';
    public const PATHWAY_DATA_FILE = 'pathway_%s.json';
    public const PATHWAY_IMAGE_FILE = 'pathway_%s.png';

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
            $nodesByPathwaySmall = [];
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
                            $nodesByPathwaySmall[$pId] = [];
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
                        $nodesByPathwaySmall[$pId][$fields['nodeId']] = [
                            'id'           => $pId . ';' . $fields['nodeId'],
                            'isEndpoint'   => $fields['isEndpoint'],
                            'activity'     => $fields['activityScore'],
                            'perturbation' => $fields['averagePerturbation'],
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
            foreach ($nodesByPathwaySmall as &$nodes) {
                ksort($nodes);
            }
            unset($nodes);
            ksort($nodesByPathwaySmall);
            $this->saveDataToCache(self::PATHWAYS_FILE, $pathways)
                 ->saveDataToCache(self::PATHWAYS_TO_NAMES_FILE, $pathwaysToNames)
                 ->saveDataToCache(self::PATHWAYS_ACTIVITY_VECTOR_FILE, $pathwaysVectors['activity'])
                 ->saveDataToCache(self::PATHWAYS_PERTURBATION_VECTOR_FILE, $pathwaysVectors['perturbation'])
                 ->saveDataToCache(self::NODES_TO_NAMES_FILE, $nodesToNames)
                 ->saveDataToCache(self::NODES_ACTIVITY_VECTOR_FILE, $nodesVectors['activity'])
                 ->saveDataToCache(self::NODES_PERTURBATION_VECTOR_FILE, $nodesVectors['perturbation'])
                 ->saveDataToCache(self::NODES_BY_PATHWAY_FILE, $nodesByPathwaySmall);
            foreach ($nodesByPathway as $pId => $data) {
                $this->saveDataToCache(
                    sprintf(self::PATHWAY_DATA_FILE, Str::slug($pId)),
                    $data
                );
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
        return $this->readCachedFile(self::PATHWAYS_FILE);
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
        return file_exists(
            $this->workingDirectory . DIRECTORY_SEPARATOR .
            sprintf(self::PATHWAY_DATA_FILE, Str::slug($pathway))
        );
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
        return $this->readCachedFile(sprintf(self::PATHWAY_DATA_FILE, Str::slug($pathway)));
    }

    /**
     * @return Collection
     * @throws JsonException
     */
    public function readPathwaysToNames(): Collection
    {
        return $this->readCachedFile(self::PATHWAYS_TO_NAMES_FILE);
    }

    /**
     * @return Collection
     * @throws JsonException
     */
    public function readNodesToNames(): Collection
    {
        return $this->readCachedFile(self::NODES_TO_NAMES_FILE);
    }

    /**
     * @return Collection
     * @throws JsonException
     */
    public function readNodesByPathway(): Collection
    {
        return $this->readCachedFile(self::NODES_BY_PATHWAY_FILE);
    }

    /**
     * @throws JsonException
     */
    private function topHandler(
        string $file,
        int $n,
        bool $absolute,
        ?string $limit,
        ?string $nameFile = null,
        ?array $appends = null
    ): Collection {
        $data = $this->readCachedFile($file)
                     ->map(fn($value, $key) => ['id' => $key, 'value' => $value])
                     ->when($limit === "positive", fn(Collection $p) => $p->filter(fn($v) => $v['value'] > 0))
                     ->when($limit === "negative", fn(Collection $p) => $p->filter(fn($v) => $v['value'] < 0))
                     ->when(
                         $absolute,
                         fn(Collection $p) => $p->map(
                             static function ($v) {
                                 $v['orig'] = $v['value'];
                                 $v['value'] = abs($v['value']);
                                 return $v;
                             }
                         )
                     )
                     ->when(
                         $limit === "negative",
                         fn($c) => $c->sortBy('value'),
                         fn($c) => $c->sortByDesc('value')
                     );
        $result = $data->take($n);
        if (!$absolute && $limit === null) {
            $result = $result->merge($data->take(-$n))->sortByDesc('value');
        }
        return $result
            ->when(
                $nameFile !== null,
                function (Collection $p) use ($nameFile) {
                    $names = $this->readCachedFile($nameFile);
                    return $p->map(
                        static function ($v) use ($names) {
                            $v['name'] = $names[$v['id']] ?? null;
                            return $v;
                        }
                    );
                }
            )
            ->when(
                $absolute,
                fn(Collection $p) => $p->map(
                    static function ($v) {
                        $v['value'] = $v['orig'];
                        unset($v['orig']);
                        return $v;
                    }
                )
            )
            ->when(
                $appends !== null,
                fn(Collection $p) => $p->map(
                    static function ($v) use ($appends) {
                        return array_merge($appends, $v);
                    }
                )
            );
    }

    /**
     * Take the top $n pathways with a positive perturbation and the top $n pathways with a negative perturbation.
     * If $absolute is TRUE it takes the top $n pathways by using their absolute value.
     * If $limit is "positive" ("negative"), it takes the top $n positive (negative) pathways.
     *
     * @param int $n
     * @param bool $absolute
     * @param string|null $limit
     * @return Collection
     * @throws JsonException
     */
    public function topPerturbedPathways(
        int $n = 10,
        bool $absolute = false,
        ?string $limit = null,
        ?array $appends = null
    ): Collection {
        return $this->topHandler(
            self::PATHWAYS_PERTURBATION_VECTOR_FILE,
            $n,
            $absolute,
            $limit,
            self::PATHWAYS_TO_NAMES_FILE,
            $appends
        );
    }

    /**
     * Take the top $n pathways with a positive activity score and the top $n pathways with a negative activity score.
     * If $absolute is TRUE it takes the top $n pathways by using their absolute value.
     * If $limit is "positive" ("negative"), it takes the top $n positive (negative) pathways.
     *
     * @param int $n
     * @param bool $absolute
     * @param string|null $limit
     * @return Collection
     * @throws JsonException
     */
    public function topActivePathways(
        int $n = 10,
        bool $absolute = false,
        ?string $limit = null,
        ?array $appends = null
    ): Collection {
        return $this->topHandler(
            self::PATHWAYS_ACTIVITY_VECTOR_FILE,
            $n,
            $absolute,
            $limit,
            self::PATHWAYS_TO_NAMES_FILE,
            $appends
        );
    }

    /**
     * Take the top $n nodes with a positive perturbation and the top $n nodes with a negative perturbation.
     * If $absolute is TRUE it takes the top $n nodes by using their absolute value.
     * If $limit is "positive" ("negative"), it takes the top $n positive (negative) nodes.
     *
     * @param int $n
     * @param bool $absolute
     * @param string|null $limit
     * @return Collection
     * @throws JsonException
     */
    public function topPerturbedNodes(
        int $n = 10,
        bool $absolute = false,
        ?string $limit = null,
        ?array $appends = null
    ): Collection {
        return $this->topHandler(
            self::NODES_PERTURBATION_VECTOR_FILE,
            $n,
            $absolute,
            $limit,
            self::NODES_TO_NAMES_FILE,
            $appends
        );
    }

    /**
     * Take the top $n nodes with a positive activity score and the top $n nodes with a negative activity score.
     * If $absolute is TRUE it takes the top $n nodes by using their absolute value.
     * If $limit is "positive" ("negative"), it takes the top $n positive (negative) nodes.
     *
     * @param int $n
     * @param bool $absolute
     * @param string|null $limit
     * @return Collection
     * @throws JsonException
     */
    public function topActiveNodes(
        int $n = 10,
        bool $absolute = false,
        ?string $limit = null,
        ?array $appends = null
    ): Collection {
        return $this->topHandler(
            self::NODES_ACTIVITY_VECTOR_FILE,
            $n,
            $absolute,
            $limit,
            self::NODES_TO_NAMES_FILE,
            $appends
        );
    }

    /**
     * @throws JsonException
     */
    private function searchHandler(
        string $file,
        array $keys,
        ?string $nameFile = null,
        ?array $appends = null
    ): Collection {
        $data = $this->readCachedFile($file)
                     ->map(fn($value, $key) => ['id' => $key, 'value' => $value])
                     ->whereIn('id', $keys)
                     ->when(
                         $nameFile !== null,
                         function (Collection $p) use ($nameFile) {
                             $names = $this->readCachedFile($nameFile);
                             return $p->map(
                                 static function ($v) use ($names) {
                                     $v['name'] = $names[$v['id']] ?? null;
                                     return $v;
                                 }
                             );
                         }
                     )
                     ->when(
                         $appends !== null,
                         fn(Collection $p) => $p->map(
                             static function ($v) use ($appends) {
                                 return array_merge($appends, $v);
                             }
                         )
                     );
        // Sort in the same order as the input keys
        $result = [];
        foreach ($keys as $key) {
            $result[$key] = $data[$key];
        }
        return collect($result);
    }

    /**
     * Take a set of perturbed pathways from a simulation
     *
     * @param string[] $keys
     * @return Collection
     * @throws JsonException
     */
    public function perturbedPathways(array $keys, ?array $appends = null): Collection
    {
        return $this->searchHandler(
            self::PATHWAYS_PERTURBATION_VECTOR_FILE,
            $keys,
            self::PATHWAYS_TO_NAMES_FILE,
            $appends
        );
    }

    /**
     * Take a set of active pathways from a simulation
     *
     * @param string[] $keys
     * @return Collection
     * @throws JsonException
     */
    public function activePathways(array $keys, ?array $appends = null): Collection
    {
        return $this->searchHandler(self::PATHWAYS_ACTIVITY_VECTOR_FILE, $keys, self::PATHWAYS_TO_NAMES_FILE, $appends);
    }

    /**
     * Take a set of perturbed nodes from a simulation
     *
     * @param string[] $keys
     * @return Collection
     * @throws JsonException
     */
    public function perturbedNodes(array $keys, ?array $appends = null): Collection
    {
        return $this->searchHandler(self::NODES_PERTURBATION_VECTOR_FILE, $keys, self::NODES_TO_NAMES_FILE, $appends);
    }

    /**
     * Take a set of active nodes from a simulation
     *
     * @param string[] $keys
     * @return Collection
     * @throws JsonException
     */
    public function activeNodes(array $keys, ?array $appends = null): Collection
    {
        return $this->searchHandler(self::NODES_ACTIVITY_VECTOR_FILE, $keys, self::NODES_TO_NAMES_FILE, $appends);
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
        $outputFile = $this->workingDirectory . DIRECTORY_SEPARATOR . sprintf(
                self::PATHWAY_IMAGE_FILE,
                Str::slug($pathway)
            );
        if (!file_exists($outputFile)) {
            $inputFile = $this->workingDirectory . DIRECTORY_SEPARATOR . sprintf(
                    self::PATHWAY_DATA_FILE,
                    Str::slug($pathway)
                );
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
