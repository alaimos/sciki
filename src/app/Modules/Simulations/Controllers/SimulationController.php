<?php

namespace App\Modules\Simulations\Controllers;

use App\Http\Controllers\Controller;
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
        /*
array:5 [▼
  "name" => "Test"
  "existing" => false
  "organism" => 1
  "tags" => array:1 [▼
    0 => "virus: sars-cov-2"
  ]
  "nodes" => array:10 [▼
    1 => 2
    2 => 1
    3 => 0
    4 => -1
    5 => 0
    6 => 1
    7 => 2
    8 => 1
    9 => 0
    10 => -1
  ]
]
         */
    }

}
