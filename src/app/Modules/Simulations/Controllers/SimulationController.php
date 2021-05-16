<?php

namespace App\Modules\Simulations\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Simulations\Models\Node;
use App\Modules\Simulations\Models\Organism;
use App\Modules\Simulations\Models\Simulation;
use App\Modules\Simulations\Resources\NodeResource;
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
                'nodes'     => NodeResource::collection(Node::all()),
            ]
        );
    }

}
