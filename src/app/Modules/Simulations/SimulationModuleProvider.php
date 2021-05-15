<?php

namespace App\Modules\Simulations;


use App\Modules\Abstract\ModuleProvider;
use App\Modules\Abstract\Services\AccessControlService;
use App\Modules\Simulations\Models\Organism;
use App\Modules\Simulations\Models\Simulation;
use App\Modules\Simulations\Policies\SimulationPolicy;
use JetBrains\PhpStorm\ArrayShape;
use JetBrains\PhpStorm\Pure;

class SimulationModuleProvider extends ModuleProvider
{

    private const TEST_ORGANISMS = [
        'hsa' => 'Homo Sapiens',
    ];

    private const MAX_NODES = 100;

    #[ArrayShape([Simulation::class => "string"])] public function policies(): array
    {
        return [
            Simulation::class => SimulationPolicy::class,
        ];
    }

    public function seeder(): void
    {
        foreach (self::TEST_ORGANISMS as $accession => $name) {
            $organism = Organism::create(
                [
                    'accession' => $accession,
                    'name'      => $name,
                ]
            );
            for ($i = 1; $i <= self::MAX_NODES; $i++) {
                $organism->nodes()->create(
                    [
                        'accession' => 'G' . $i,
                        'name'      => 'GENE' . $i,
                        'aliases'   => [],
                    ]
                );
            }
        }
    }

    #[Pure] public function accessControlService(): ?AccessControlService
    {
        return new Services\AccessControlService();
    }

}
