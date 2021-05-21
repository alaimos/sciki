<?php

namespace App\Modules\Simulations\Controllers;

use App\Exceptions\FileSystemException;
use App\Http\Controllers\Controller;
use App\Modules\Simulations\Models\Simulation;
use App\Modules\Simulations\Services\SimulationParserService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use JsonException;


class SimulationPluginsController extends Controller
{
    /**
     * @throws FileSystemException
     * @throws AuthorizationException
     * @throws JsonException
     */
    public function pathwaysTable(Request $request, Simulation $simulation): JsonResponse
    {
        $this->authorize('view', $simulation);

        if ($simulation->status !== Simulation::COMPLETED) {
            abort(404);
        }

        $pathwaysCollection = (new SimulationParserService($simulation))->readPathwaysList();
        $pathways = (array)$request->get('pathways');
        if (!empty($pathways)) {
            $pathwaysCollection->whereIn('pathwayId', $pathways);
        }

        return response()->json($pathwaysCollection);
    }

    /**
     * @throws FileSystemException
     * @throws AuthorizationException
     * @throws JsonException
     */
    public function nodesTable(Request $request, Simulation $simulation): JsonResponse
    {
        $this->authorize('view', $simulation);

        if ($simulation->status !== Simulation::COMPLETED) {
            abort(404);
        }

        $simulationService = new SimulationParserService($simulation);
        $pathway = $request->get('pathway');
        if (!$simulationService->hasPathway($pathway)) {
            abort(404);
        }
        $nodesCollection = $simulationService->readPathway($pathway);
        $pathways = (array)$request->get('nodes');
        if (!empty($pathways)) {
            $nodesCollection->whereIn('nodeId', $pathways);
        }

        return response()->json($nodesCollection);
    }
}
