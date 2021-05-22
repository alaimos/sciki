<?php
/** @noinspection LaravelFunctionsInspection */

return [

    'phensim_api_url'    => env('PHENSIM_API_URL'),
    'phensim_key'        => env('PHENSIM_KEY'),
    'phensim_executable' => env('PHENSIM_EXECUTABLE', resource_path('bin/MITHrIL2.jar')),
    'build_graph'        => env('PHENSIM_BUILD_GRAPH_PATH', resource_path('bin/build_graph.R')),
];
