<?php

namespace App\Modules\Simulations\Jobs;

use App\Modules\Simulations\Models\Simulation;
use App\Modules\Simulations\Services\SimulationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncSimulationJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    private Simulation $simulation;
    private bool $syncNodes;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(Simulation $simulation, bool $syncNodes)
    {
        $this->simulation = $simulation;
        $this->syncNodes = $syncNodes;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(): void
    {
        (new SimulationService())->pullRemotePhensimSimulation($this->simulation, $this->syncNodes);
    }
}
