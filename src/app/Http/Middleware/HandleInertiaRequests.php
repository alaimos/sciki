<?php

namespace App\Http\Middleware;

use App\Services\AccessControlService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{

    private AccessControlService $accessControlService;

    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     * @var string
     */
    protected $rootView = 'layouts.inertia';

    public function __construct(AccessControlService $accessControlService)
    {
        $this->accessControlService = $accessControlService;
    }


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
                'auth.check'    => $userIsLoggedIn,
                'auth.user'     => fn() => $userIsLoggedIn ? auth()->user()->only(
                    [
                        'id',
                        'name',
                        'email',
                        'role_id',
                        'avatar',
                    ]
                ) : null,
                'capabilities'  => fn() => $this->accessControlService->getCommonCapabilities(),
                'flash.success' => fn() => $request->session()->get('success'),
                'flash.error'   => fn() => $request->session()->get('error'),
                'flash.status'  => fn() => $request->session()->get('status'),
            ]
        );
    }
}
