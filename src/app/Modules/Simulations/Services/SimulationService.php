<?php

namespace App\Modules\Simulations\Services;


use App\Modules\Simulations\Jobs\SyncSimulationJob;
use App\Modules\Simulations\Models\Node;
use App\Modules\Simulations\Models\Organism;
use App\Modules\Simulations\Models\Simulation;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;
use JetBrains\PhpStorm\ArrayShape;
use Mockery\Exception;

class SimulationService
{

    public const PHENSIM_TO_SCIKI = [
        'OVEREXPRESSION'  => Simulation::OVER_EXPRESSED,
        'UNDEREXPRESSION' => Simulation::UNDER_EXPRESSED,
    ];

    #[ArrayShape([
        'data'        => "\App\Modules\Simulations\Models\Node[]|array",
        'sizePerPage' => "int",
        'page'        => "int",
        'totalSize'   => "int",
    ])] public function handleNodesTableRequest(
        Organism $organism,
        Request $request
    ): array {
        $nodesQuery = $organism->nodes()->select(['id', 'accession', 'name']);
        $filters = $request->get("filters");
        if (!empty($filters) && is_array($filters)) {
            foreach ($filters as $field => $description) {
                $value = $description['filterVal'] ?? '';
                if (!empty($field) && !empty($value)) {
                    $nodesQuery->where($field, 'like', '%' . $value . '%');
                }
            }
        }
        $sortField = $request->get("sortField");
        if (!empty($sortField)) {
            $sortOrder = $request->get("sortOrder", "desc");
            $nodesQuery->orderBy($sortField, $sortOrder);
        }

        $paginatedNodes = $nodesQuery->paginate(
            $request->get('sizePerPage', 10),
            page: $request->get('page', 1)
        );

        return [
            'data'        => $paginatedNodes->all(),
            'sizePerPage' => $paginatedNodes->perPage(),
            'page'        => $paginatedNodes->currentPage(),
            'totalSize'   => $paginatedNodes->total(),
        ];
    }

    /**
     * Returns the complete URL of an endpoint in PHENSIM api
     *
     * @param $endpoint
     *
     * @return string
     */
    private function getPhensimEndpointUrl($endpoint): string
    {
        return config('sciki.phensim_api_url') . '/' . $endpoint;
    }

    /**
     * Returns an Http PendingRequest for the PHENSIM API
     *
     * @return \Illuminate\Http\Client\PendingRequest
     */
    private function getPhensimHttpRequest(): PendingRequest
    {
        return Http::withHeaders(
            [
                'Accept'        => 'application/json',
                'Authorization' => sprintf('Bearer %s', config('sciki.phensim_key')),
            ]
        );
    }

    /**
     * Checks if a remote simulation is completed.
     * Only completed simulations are considered valid.
     *
     * @param  int  $remoteId
     *
     * @return bool
     */
    public function checkValidRemoteSimulation(int $remoteId): bool
    {
        $response = $this->getPhensimHttpRequest()
                         ->get(
                             $this->getPhensimEndpointUrl('simulations/' . $remoteId)
                         );

        if (!$response->successful()) {
            return false;
        }

        return $response->json('data.status') === Simulation::COMPLETED;
    }

    /**
     * Download a file from a remote phensim simulation
     *
     * @param  string  $url
     * @param  string  $destination
     */
    private function downloadRemotePhensimFile(string $url, string $destination): void
    {
        $response = $this->getPhensimHttpRequest()->get($url);
        if (!$response->successful()) {
            throw new \RuntimeException('Unable to download "' . $url . '"');
        }
        file_put_contents($destination, $response->body());
    }

    /**
     * Pulls the output file from a remote phensim simulation
     * TODO: remove this function as soon as PHENSIM API bug is solved
     *
     * @param  \App\Modules\Simulations\Models\Simulation  $simulation
     * @param  array  $simulationRemoteLinks
     *
     * @return string
     */
    private function pullOutputFile(Simulation $simulation, array $simulationRemoteLinks): string
    {
        // @todo everything after ?? is a fix for a PHENSIM API bug. Remove as soon as new version with bugfix is online.
        $outputLink = $simulationRemoteLinks['output'] ?? sprintf(
                'https://phensim.tech/api/v1/simulations/%d/download/output',
                $simulation->id
            );
        $outputFileName = 'output.tsv';
        $this->downloadRemotePhensimFile($outputLink, $simulation->fileAbsolutePath($outputFileName));

        return $outputFileName;
    }

    /**
     * Pulls a file from a remote phensim simulation
     *
     * @param  \App\Modules\Simulations\Models\Simulation  $simulation
     * @param  string  $type
     * @param  array  $simulationRemoteLinks
     *
     * @return string|null
     */
    private function pullFile(Simulation $simulation, string $type, array $simulationRemoteLinks): ?string
    {
        if (!isset($simulationRemoteLinks[$type]) || $simulationRemoteLinks[$type] === null) {
            return null;
        }
        $remoteFileLink = $simulationRemoteLinks[$type];
        $filename = $type . '.tsv';
        $this->downloadRemotePhensimFile($remoteFileLink, $simulation->fileAbsolutePath($filename));

        return $filename;
    }

    /**
     * Sync all input nodes from a remote phensim simulation with the local database
     *
     * @param  \App\Modules\Simulations\Models\Simulation  $simulation
     * @param  array  $simulationRemoteLinks
     */
    private function syncInputNodes(Simulation $simulation, array $simulationRemoteLinks): void
    {
        $tmpFile = $this->pullFile($simulation, 'input_parameters', $simulationRemoteLinks);
        if ($tmpFile === null) {
            return;
        }
        $inputContent = file_get_contents($simulation->fileAbsolutePath($tmpFile));
        $inputDataArray = array_map(static fn($line) => explode("\t", $line), explode(PHP_EOL, $inputContent));
        $accessionNumbers = array_map(static fn($line) => $line[0], $inputDataArray);
        $identifierMap = Node::whereIn('accession', $accessionNumbers)->pluck('id', 'accession');
        $dataToSync = [];
        foreach ($inputDataArray as $line) {
            if (isset($identifierMap[$line[0]])) {
                $dataToSync[$identifierMap[$line[0]]] = [
                    'type' => self::PHENSIM_TO_SCIKI[$line[1]],
                ];
            }
        }
        if (!empty($dataToSync)) {
            $simulation->nodes()->sync($dataToSync);
        }
        @unlink($simulation->fileAbsolutePath($tmpFile));
    }

    /**
     * Sync all non-expressed nodes from a remote phensim simulation with the local database
     *
     * @param  \App\Modules\Simulations\Models\Simulation  $simulation
     * @param  array  $simulationRemoteLinks
     */
    private function syncNonExpressedNodes(Simulation $simulation, array $simulationRemoteLinks): void
    {
        $tmpFile = $this->pullFile($simulation, 'non_expressed_nodes', $simulationRemoteLinks);
        if ($tmpFile === null) {
            return;
        }
        $inputContent = file_get_contents($simulation->fileAbsolutePath($tmpFile));
        $identifiers = Node::whereIn('accession', explode("\t", $inputContent))->pluck('id');
        $simulation->nodes()->syncWithPivotValues(
            $identifiers,
            [
                'type' => Simulation::NON_EXPRESSED,
            ]
        );
        @unlink($simulation->fileAbsolutePath($tmpFile));
    }

    /**
     * Sync all knocked-out nodes from a remote phensim simulation with the local database
     *
     * @param  \App\Modules\Simulations\Models\Simulation  $simulation
     * @param  array  $simulationRemoteLinks
     */
    private function syncKnockedOutNodes(Simulation $simulation, array $simulationRemoteLinks): void
    {
        $tmpFile = $this->pullFile($simulation, 'removed_nodes', $simulationRemoteLinks);
        if ($tmpFile === null) {
            return;
        }
        $inputContent = file_get_contents($simulation->fileAbsolutePath($tmpFile));
        $identifiers = Node::whereIn('accession', explode("\t", $inputContent))->pluck('id');
        $simulation->nodes()->syncWithPivotValues(
            $identifiers,
            [
                'type' => Simulation::KNOCKOUT,
            ]
        );
        @unlink($simulation->fileAbsolutePath($tmpFile));
    }

    /**
     * Pulls output files and parameters from a remote phensim simulation
     *
     * @param  \App\Modules\Simulations\Models\Simulation  $simulation
     * @param  bool  $syncParameters
     */
    public function pullRemotePhensimSimulation(Simulation $simulation, bool $syncParameters = false): void
    {
        if (!$this->checkValidRemoteSimulation($simulation->remote_id)) {
            throw new \RuntimeException('The input simulation does not exist on the remote server');
        }
        $remoteSimulationResponse = $this->getPhensimHttpRequest()
                                         ->get(
                                             $this->getPhensimEndpointUrl('simulations/' . $simulation->remote_id)
                                         );
        if (!$remoteSimulationResponse->successful()) {
            throw new \RuntimeException('Unable to get simulation data from the PHENSIM server');
        }
        $simulationRemoteLinks = $remoteSimulationResponse->json('data.links');
        $updatedSimulationData = [
            'status'              => $remoteSimulationResponse->json('data.status'),
            'output_file'         => $this->pullOutputFile($simulation, $simulationRemoteLinks),
            'pathway_output_file' => $this->pullFile($simulation, 'pathway_output', $simulationRemoteLinks),
            'nodes_output_file'   => $this->pullFile($simulation, 'nodes_output', $simulationRemoteLinks),

        ];
        if ($syncParameters) {
            $updatedSimulationData['organism_id'] = Organism::whereAccession(
                $remoteSimulationResponse->json('data.organism')
            )->firstOrFail()->id;
            $this->syncInputNodes($simulation, $simulationRemoteLinks);
            $this->syncNonExpressedNodes($simulation, $simulationRemoteLinks);
            $this->syncKnockedOutNodes($simulation, $simulationRemoteLinks);
        }
        $simulation->update($updatedSimulationData);
    }

    /**
     * Get accession numbers of a set of nodes
     *
     * @param  \App\Modules\Simulations\Models\Simulation  $simulation
     * @param  int  $type
     *
     * @return array
     */
    private function getNodesAccessionByType(Simulation $simulation, int $type): array
    {
        return $simulation->nodes()->wherePivot('type', $type)->pluck('accession')->toArray();
    }

    /**
     * Submit a simulation to the phensim remote server
     *
     * @param  \App\Modules\Simulations\Models\Simulation  $simulation
     */
    private function submitRemotePhensimSimulation(Simulation $simulation): void
    {
        $nodes = [];
        $overExpressedNodes = $this->getNodesAccessionByType($simulation, Simulation::OVER_EXPRESSED);
        if (!empty($overExpressedNodes)) {
            $nodes['overExpressed'] = $overExpressedNodes;
        }
        $underExpressedNodes = $this->getNodesAccessionByType($simulation, Simulation::UNDER_EXPRESSED);
        if (!empty($underExpressedNodes)) {
            $nodes['underExpressed'] = $underExpressedNodes;
        }
        $nonExpressedNodes = $this->getNodesAccessionByType($simulation, Simulation::NON_EXPRESSED);
        if (!empty($nonExpressedNodes)) {
            $nodes['nonExpressed'] = $nonExpressedNodes;
        }
        $knockedOutNodes = $this->getNodesAccessionByType($simulation, Simulation::KNOCKOUT);
        if (!empty($knockedOutNodes)) {
            $nodes['knockout'] = $knockedOutNodes;
        }


        $simulationData = [
            'name'     => 'From Sciki: ' . $simulation->name,
            'organism' => $simulation->organism->accession,
            'miRNAs'   => true,
            'reactome' => true,
            'fast'     => true,
            'submit'   => true,
            'seed'     => 1234,
            'nodes'    => $nodes,
            //@todo remove hard-coded url for development
            'callback' => 'https://docs.alaimos.com' . URL::signedRoute(
                    'simulations.callback',
                    ['simulation' => $simulation->id],
                    absolute: false
                ),
        ];
        $response = $this->getPhensimHttpRequest()->post($this->getPhensimEndpointUrl('simulations'), $simulationData);
        if (!$response->successful()) {
            throw new \RuntimeException($response->json('message') ?? 'An error occurred');
        }
//        $simulation->remote_id = (int)$response->json('data.id');
//        $simulation->save();
    }

    /**
     * Save a local copy of the simulation and submit the details to the phensim remote server
     *
     * @param  array  $validatedData
     *
     * @return \App\Modules\Simulations\Models\Simulation
     * @throws \Throwable
     */
    public function saveAndSubmitSimulation(array $validatedData): Simulation
    {
        DB::beginTransaction();
        try {
            $existing = $validatedData['existing'];
            $newSimulation = Simulation::create(
                [
                    'name'        => $validatedData['name'],
                    'organism_id' => $validatedData['organism'] ?? null,
                    'remote_id'   => $existing ? $validatedData['remote_id'] : null,
                    'status'      => Simulation::READY,
                    'user_id'     => auth()->id(),
                ]
            );
            $newSimulation->syncFormattedTags($validatedData['tags']);
            $newSimulation->save();
            if ($existing) {
                SyncSimulationJob::dispatch($newSimulation, true);
            } else {
                $newSimulation->nodes()->sync(
                    array_map(
                        static fn($value) => [
                            'type' => $value,
                        ],
                        $validatedData['nodes']
                    )
                );
                $newSimulation->save();
                $this->submitRemotePhensimSimulation($newSimulation);
            }
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }

        return $newSimulation;
    }
}
