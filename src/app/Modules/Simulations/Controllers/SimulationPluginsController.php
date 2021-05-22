<?php

namespace App\Modules\Simulations\Controllers;

use App\Exceptions\FileSystemException;
use App\Http\Controllers\Controller;
use App\Modules\Simulations\Models\Simulation;
use App\Modules\Simulations\Services\SimulationParserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use JsonException;
use Throwable;


class SimulationPluginsController extends Controller
{
    /**
     * @throws FileSystemException
     * @throws JsonException
     */
    public function pathwaysTable(Request $request, Simulation $simulation): JsonResponse
    {
        if (!$simulation->canBeViewed()) {
            abort(404);
        }

        if ($simulation->status !== Simulation::COMPLETED) {
            abort(404);
        }

        $pathwaysCollection = (new SimulationParserService($simulation))->readPathwaysList();
        $pathways = (array)$request->get('pathways');
        if (!empty($pathways)) {
            $pathwaysCollection = $pathwaysCollection->whereIn('pathwayId', $pathways);
        }

        return response()->json($pathwaysCollection);
    }

    /**
     * @throws FileSystemException
     * @throws JsonException
     */
    public function nodesTable(Request $request, Simulation $simulation): JsonResponse
    {
        if (!$simulation->canBeViewed()) {
            abort(404);
        }

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

    /**
     * @throws FileSystemException
     * @throws JsonException
     * @throws Throwable
     */
    public function pathwayImage(Request $request, Simulation $simulation): JsonResponse
    {
        if (!$simulation->canBeViewed()) {
            abort(404);
        }

        if ($simulation->status !== Simulation::COMPLETED) {
            abort(404);
        }

        $simulationService = new SimulationParserService($simulation);
        $pathway = $request->get('pathway');
        if (!$simulationService->hasPathway($pathway)) {
            abort(404);
        }
        $imageFile = $simulationService->makePathwayImage($pathway, $simulation->organism->accession);
        $image = 'data:image/png;base64,' . base64_encode(file_get_contents($imageFile));
        return response()->json(
            [
                'data' => $image,
            ]
        );
    }
}
