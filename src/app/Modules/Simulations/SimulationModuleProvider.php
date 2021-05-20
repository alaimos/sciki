<?php

namespace App\Modules\Simulations;


use App\Modules\Abstract\ModuleProvider;
use App\Modules\Abstract\ScikiSidebarLink;
use App\Modules\Abstract\Services\AccessControlService;
use App\Modules\Simulations\Controllers\SimulationController;
use App\Modules\Simulations\Models\Simulation;
use App\Modules\Simulations\Policies\SimulationPolicy;
use Illuminate\Support\Facades\Artisan;
use JetBrains\PhpStorm\ArrayShape;
use JetBrains\PhpStorm\Pure;
use Route;

class SimulationModuleProvider extends ModuleProvider
{

    #[ArrayShape([Simulation::class => "string"])] public function policies(): array
    {
        return [
            Simulation::class => SimulationPolicy::class,
        ];
    }

    public function seeder(): void
    {
        Artisan::call('import:database');
    }

    #[Pure] public function accessControlService(): ?AccessControlService
    {
        return new Services\AccessControlService();
    }

    public function publicRoutes(): void
    {
        Route::post('simulations/{simulation}/callback', [SimulationController::class, 'phensimCallback'])->middleware(
            'signed:relative' //TODO: remove relative in production
        )->name('simulations.callback');
        Route::post('simulations/table', [SimulationController::class, 'table'])->name('simulations.table');
        Route::resource('simulations', SimulationController::class)->only('index');
    }

    public function editorRoutes(): void
    {
        Route::post('simulations/create/nodes/{organism}', [SimulationController::class, 'nodesTable'])->name('simulations.nodes.table');
        Route::get('simulations/{simulation}/publish', [SimulationController::class, 'togglePublic'])->name('simulations.publish');
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
