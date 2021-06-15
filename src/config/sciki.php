<?php

use App\Modules\Simulations\SimulationModuleProvider;

return [

    'java_executable'    => env('JAVA_EXECUTABLE'),
    'rscript_executable' => env('RSCRIPT_EXECUTABLE'),

    'resource_providers' => [
        SimulationModuleProvider::class,
    ],

    'proxy_url'    => env('PROXY_URL'),
    'proxy_scheme' => env('PROXY_SCHEMA'),
];
