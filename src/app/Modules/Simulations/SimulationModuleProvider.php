<?php

namespace App\Modules\Simulations;


use App\Modules\Abstract\ModuleProvider;
use App\Modules\Abstract\ScikiSidebarLink;
use App\Modules\Abstract\Services\AccessControlService;
use App\Modules\Simulations\Controllers\SimulationController;
use App\Modules\Simulations\Controllers\SimulationPluginsController;
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

    public function accessControlService(): ?AccessControlService
    {
        return new Services\AccessControlService();
    }

    public function publicRoutes(): void
    {
        Route::post('simulations/{simulation}/callback', [SimulationController::class, 'phensimCallback'])->middleware(
            'signed:relative' //TODO: remove relative in production
        )->name('simulations.callback');
        Route::post(
            'simulations/{simulation}/plugins/pathwaysTable',
            [SimulationPluginsController::class, 'pathwaysTable']
        )->name('simulations.plugins.pathwaysTable');
        Route::post(
            'simulations/{simulation}/plugins/nodesTable',
            [SimulationPluginsController::class, 'nodesTable']
        )->name('simulations.plugins.nodesTable');
        Route::post(
            'simulations/{simulation}/plugins/pathwayImage',
            [SimulationPluginsController::class, 'pathwayImage']
        )->name('simulations.plugins.pathwayImage');
        Route::post(
            'simulations/{simulation}/plugins/heatmap',
            [SimulationPluginsController::class, 'heatmap']
        )->name('simulations.plugins.heatmap');
        Route::post(
            'simulations/{simulation}/plugins/correlation',
            [SimulationPluginsController::class, 'correlation']
        )->name('simulations.plugins.correlation');
        Route::post(
            'simulations/{simulation}/plugins/partialCorrelation',
            [SimulationPluginsController::class, 'partialCorrelation']
        )->name('simulations.plugins.partialCorrelation');

        Route::post(
            'simulations/typeahead',
            [SimulationPluginsController::class, 'simulationTypeahead']
        )->name('simulations.plugins.typeahead');
        Route::post('simulations/table', [SimulationController::class, 'table'])->name('simulations.table');
        Route::resource('simulations', SimulationController::class)
             ->where(
                 [
                     'simulation' => '[0-9]+',
                 ]
             )->only(['index', 'show']);
    }

    public function editorRoutes(): void
    {
        Route::post('simulations/create/nodes/{organism}', [SimulationController::class, 'nodesTable'])->name(
            'simulations.nodes.table'
        );
        Route::get('simulations/{simulation}/publish', [SimulationController::class, 'togglePublic'])->name(
            'simulations.publish'
        );
        Route::patch('simulations/{simulation}/name', [SimulationController::class, 'updateName'])->name(
            'simulations.updateName'
        );
        Route::post('simulations/{simulation}/syncTags', [SimulationController::class, 'syncTags'])->name(
            'simulations.syncTags'
        );
        Route::resource('simulations', SimulationController::class)->except(['index', 'show']);
    }

    #[Pure] public function exposesGuiResources(): array
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
