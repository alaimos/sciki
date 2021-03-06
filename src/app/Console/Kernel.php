<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     *
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('inspire')->hourly();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands(): void
    {
        $commandsDirectories = [
            __DIR__ . '/Commands',
        ];
        foreach (config('sciki.resource_providers') as $provider) {
            $commandsDirectory = app($provider)->commandsDirectory();
            if ($commandsDirectory) {
                $commandsDirectories[] = $commandsDirectory;
            }
        }
        $this->load($commandsDirectories);

        require base_path('routes/console.php');
    }
}
