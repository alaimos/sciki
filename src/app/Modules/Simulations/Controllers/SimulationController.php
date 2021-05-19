<?php

namespace App\Modules\Simulations\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Simulations\Jobs\SyncSimulationJob;
use App\Modules\Simulations\Models\Node;
use App\Modules\Simulations\Models\Organism;
use App\Modules\Simulations\Models\Simulation;
use App\Modules\Simulations\Requests\SaveSimulationRequest;
use App\Modules\Simulations\Resources\NodeResource;
use App\Modules\Simulations\Services\SimulationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Mockery\Exception;
use Throwable;


class SimulationController extends Controller
{

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
        $data = $request->validated();

        $redirectResponse = redirect()->route('wiki.index');
        try {
            (new SimulationService())->saveAndSubmitSimulation($data);
            $redirectResponse->with('success', 'The simulation has been created and submitted to PHENSIM');
        } catch (Throwable $e) {
            $redirectResponse->with('error', $e->getMessage());
        }

        return $redirectResponse;
    }

    public function phensimCallback(Request $request, Simulation $simulation): JsonResponse
    {
        if ($simulation->status === Simulation::COMPLETED) {
            // If the simulation has been completed this page should appear as not found
            abort(404);
        }
        $remoteId = (int)$request->get('id');
        $status = (int)$request->get('status');
        if (!$remoteId || !array_key_exists($status, Simulation::HUMAN_READABLE_STATES)) {
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

}
