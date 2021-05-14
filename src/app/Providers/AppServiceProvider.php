<?php

namespace App\Providers;

use App\Services\AccessControlService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{

    public $bindings = [
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
        //
    }
}
