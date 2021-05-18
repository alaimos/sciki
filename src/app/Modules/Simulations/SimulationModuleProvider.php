<?php

namespace App\Modules\Simulations;


use App\Modules\Abstract\ModuleProvider;
use App\Modules\Abstract\ScikiSidebarLink;
use App\Modules\Abstract\Services\AccessControlService;
use App\Modules\Simulations\Controllers\SimulationController;
use App\Modules\Simulations\Models\Organism;
use App\Modules\Simulations\Models\Simulation;
use App\Modules\Simulations\Policies\SimulationPolicy;
use JetBrains\PhpStorm\ArrayShape;
use JetBrains\PhpStorm\Pure;
use Route;

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

    public function publicRoutes(): void
    {
        Route::resource('simulations', SimulationController::class)->only('index');
    }

    public function editorRoutes(): void
    {
        Route::post('simulations/create/nodes/{organism}', [SimulationController::class, 'nodesTable'])->name('simulations.nodes.table');
        Route::resource('simulations', SimulationController::class)->except(['index']);
    }

    public function exposesGuiResources(): array
    {
        return [
            new ScikiSidebarLink(
                'Simulations', 'simulations.index',
                'fa-server text-primary', 'simulations',
                'list'
            ),
        ];
    }

    public function exposesGuiTools(): array
    {
        return [
            new ScikiSidebarLink(
                'New simulation', 'simulations.create',
                'fa-server text-green', 'simulations',
                'create'
            ),
        ];
    }

}
