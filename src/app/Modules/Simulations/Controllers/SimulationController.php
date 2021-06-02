<?php

namespace App\Modules\Simulations\Controllers;

use App\Exceptions\FileSystemException;
use App\Http\Controllers\Controller;
use App\Modules\Simulations\Jobs\SyncSimulationJob;
use App\Modules\Simulations\Models\Organism;
use App\Modules\Simulations\Models\Simulation;
use App\Modules\Simulations\Requests\SaveSimulationRequest;
use App\Modules\Simulations\Services\SimulationParserService;
use App\Modules\Simulations\Services\SimulationService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use JsonException;


class SimulationController extends Controller
{

    /**
     * @throws AuthorizationException
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Simulation::class);
        return Inertia::render(
            'Modules/Simulations/Index',
            [
                'organisms' => Organism::select(['id', 'name'])->get(),
                'states'    => Simulation::HUMAN_READABLE_STATES,
            ]
        );
    }

    /**
     * @throws AuthorizationException
     */
    public function table(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Simulation::class);
        return response()->json((new SimulationService())->handleSimulationsTableRequest($request));
    }

    /**
     * @throws FileSystemException
     * @throws JsonException
     * @throws AuthorizationException
     */
    public function show(Simulation $simulation): Response
    {
        $this->authorize('view', $simulation);
        if ($simulation->status !== Simulation::COMPLETED) {
            abort(404);
        }

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

    /**
     * @throws AuthorizationException
     */
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

    /**
     * @throws AuthorizationException
     */
    public function nodesTable(Request $request, Organism $organism): JsonResponse
    {
        $this->authorize('create', Simulation::class);

        return response()->json((new SimulationService())->handleNodesTableRequest($organism, $request));
    }

    /**
     * @throws AuthorizationException
     */
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

    /**
     * @throws AuthorizationException
     */
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

    /**
     * @throws AuthorizationException
     */
    public function destroy(Simulation $simulation): RedirectResponse
    {
        $this->authorize('delete', $simulation);

        $simulation->delete();

        return redirect()->route('simulations.index');
    }

}
