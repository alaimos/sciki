<?php

namespace App\Providers;

use App\Models\Comment;
use App\Models\Page;
use App\Policies\CommentPolicy;
use App\Policies\PagePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        Page::class    => PagePolicy::class,
        Comment::class => CommentPolicy::class,
    ];

    public function policies(): array
    {
        $policies = [$this->policies];
        foreach (config('sciki.resource_providers') as $resourceProviderClass) {
            $policies[] = app($resourceProviderClass)->policies();
        }

        return array_merge(...$policies);
    }


    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();
        //
    }
}
