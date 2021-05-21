<?php

namespace App\Modules\Simulations\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Simulations\Jobs\SyncSimulationJob;
use App\Modules\Simulations\Models\Organism;
use App\Modules\Simulations\Models\Simulation;
use App\Modules\Simulations\Requests\SaveSimulationRequest;
use App\Modules\Simulations\Services\SimulationParserService;
use App\Modules\Simulations\Services\SimulationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;


class SimulationController extends Controller
{

    public function index(): Response
    {
        return Inertia::render(
            'Modules/Simulations/Index',
            [
                'organisms' => Organism::select(['id', 'name'])->get(),
                'states'    => Simulation::HUMAN_READABLE_STATES,
            ]
        );
    }

    public function table(Request $request): JsonResponse
    {
        return response()->json((new SimulationService())->handleSimulationsTableRequest($request));
    }

    /**
     * @throws \App\Exceptions\FileSystemException
     * @throws \Illuminate\Auth\Access\AuthorizationException
     * @throws \JsonException
     */
    public function show(Simulation $simulation): Response
    {
        $this->authorize('view', $simulation);

        $simulationService = new SimulationParserService($simulation);

        return Inertia::render(
            'Modules/Simulations/Show',
            [
                'simulation'      => $simulation,
                'pathwaysToNames' => $simulationService->readPathwaysToNames(),
                'nodesToNames'    => $simulationService->readNodesToNames(),
            ]
        );
    }

    public function create(): Response
    {
        $this->authorize('create', Simulation::class);

        return Inertia::render(
            'Modules/Simulations/Create',
            [
                'organisms' => Organism::select(['id', 'name'])->get(),
            ]
        );
    }

    public function nodesTable(Request $request, Organism $organism): JsonResponse
    {
        $this->authorize('create', Simulation::class);

        return response()->json((new SimulationService())->handleNodesTableRequest($organism, $request));
    }

    public function store(SaveSimulationRequest $request): RedirectResponse
    {
        $this->authorize('create', Simulation::class);

        $data = $request->validated();

        (new SimulationService())->saveAndSubmitSimulation($data);

        return
            redirect()
                ->route('simulations.index')
                ->with('success', 'The simulation has been created and submitted to PHENSIM');
    }

    public function phensimCallback(Request $request, Simulation $simulation): JsonResponse
    {
        if ($simulation->status === Simulation::COMPLETED) {
            // If the simulation has been completed this page should appear as not found
            abort(404);
        }
        $remoteId = (int)$request->get('id');
        $status = (int)$request->get('status');
        if (!$remoteId || !in_array($status, Simulation::VALID_STATES, true)) {
            abort(422, 'Invalid parameters');
        }
        if ($simulation->remote_id && $remoteId !== $simulation->remote_id) {
            abort(422, 'Invalid remote identifier');
        }
        $simulation->update(
            [
                'remote_id' => $remoteId,
                'status'    => $status,
            ]
        );
        if ($status === Simulation::COMPLETED) {
            SyncSimulationJob::dispatch($simulation, false);
        }

        return response()->json(['ok' => true]);
    }

    public function togglePublic(Simulation $simulation): RedirectResponse
    {
        $this->authorize('update', $simulation);

        $simulation->update(
            [
                'public' => !$simulation->public,
            ]
        );

        return redirect()->route('simulations.index');
    }

    public function destroy(Simulation $simulation): RedirectResponse
    {
        $this->authorize('delete', $simulation);

        $simulation->delete();

        return redirect()->route('simulations.index');
    }

}
