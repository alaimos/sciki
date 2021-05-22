<?php

namespace App\Providers;

use App\Services\AccessControlService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{

    public $singletons = [
        AccessControlService::class => AccessControlService::class,
    ];


    /**
     * Register any application services.
     *
     * @return void
     */
    public function register(): void
    {
        foreach (config('sciki.resource_providers') as $provider) {
            if (class_exists($provider)) {
                $this->app->singleton($provider);
                $provider = app($provider);
                $configPath = $provider->configFile();
                if ($configPath) {
                    $this->mergeConfigFrom($configPath, $provider->configPrefix());
                }
            }
        }
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot(): void
    {
        foreach (config('sciki.resource_providers') as $provider) {
            $migrationsPath = app($provider)->migrationsPath();
            if ($migrationsPath) {
                $this->loadMigrationsFrom($migrationsPath);
            }
        }
    }
}
