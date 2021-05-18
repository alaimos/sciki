<?php

namespace App\Modules\Simulations\Services;


use App\Modules\Simulations\Models\Organism;
use App\Modules\Simulations\Models\Simulation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use JetBrains\PhpStorm\ArrayShape;

class SimulationService
{

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
     * Checks if a remote simulation is completed.
     * Only completed simulations are considered valid.
     *
     * @param  int  $remote_id
     *
     * @return bool
     */
    public function checkValidRemoteSimulation(int $remote_id): bool
    {
        $url = config('sciki.phensim_api_url') . '/simulations/' . $remote_id;

        $response = Http::withHeaders(
            [
                'Accept'        => 'application/json',
                'Authorization' => sprintf('Bearer %s', config('sciki.phensim_key')),
            ]
        )->get($url);

        if (!$response->successful()) {
            return false;
        }

        return $response->json('data.status') === Simulation::COMPLETED;
    }
}
