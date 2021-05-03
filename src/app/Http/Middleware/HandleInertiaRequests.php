<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Thomaswelton\LaravelGravatar\Facades\Gravatar;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     * @var string
     */
    protected $rootView = 'layouts.inertia';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return string|null
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Defines the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return array
     */
    public function share(Request $request): array
    {
        $userIsLoggedIn = auth()->check();

        return array_merge(
            parent::share($request),
            [
                'auth.check' => $userIsLoggedIn,
                'auth.user'  => fn() => $userIsLoggedIn ? auth()->user()->only(
                    [
                        'id',
                        'name',
                        'email',
                        'role_id',
                        'avatar',
                    ]
                ) : null,
            ]
        );
    }
}
