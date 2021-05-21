<?php

namespace App\Modules\Simulations\Jobs;

use App\Modules\Simulations\Models\Simulation;
use App\Modules\Simulations\Services\SimulationParserService;
use App\Modules\Simulations\Services\SimulationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

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
        try {
            (new SimulationService())->pullRemotePhensimSimulation($this->simulation, $this->syncNodes);
            (new SimulationParserService($this->simulation));
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
            Log::debug($e->getTraceAsString());
            $this->simulation->update(['status' => Simulation::FAILED]);
        }
    }
}
