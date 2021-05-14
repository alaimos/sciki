<?php


namespace App\Resources\Simulations;


use App\Models\Simulation;
use App\Resources\Abstract\ResourceProvider;
use App\Resources\Simulations\Policies\SimulationPolicy;

class SimulationResourceProvider extends ResourceProvider
{

    public function policies(): array
    {
        return [
            Simulation::class => SimulationPolicy::class,
        ];
    }

}
