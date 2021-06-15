<?php

namespace App\Http\Middleware;

use App\Models\Role;
use App\Modules\Abstract\ModuleProvider;
use App\Modules\Abstract\ScikiSidebarLink;
use App\Services\AccessControlService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{

    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     * @var string
     */
    protected $rootView = 'layouts.inertia';
    private AccessControlService $accessControlService;

    public function __construct(AccessControlService $accessControlService)
    {
        $this->accessControlService = $accessControlService;
    }


    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     *
     * @param Request $request
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
     * @param Request $request
     *
     * @return array
     */
    public function share(Request $request): array
    {
        $userIsLoggedIn = auth()->check();
        $shared = [
            parent::share($request),
            [
                'auth.check'     => $userIsLoggedIn,
                'auth.is_editor' => fn() => $userIsLoggedIn && auth()->user()->role_id === Role::EDITOR,
                'auth.is_admin'  => fn() => $userIsLoggedIn && auth()->user()->role_id === Role::ADMIN,
                'auth.user'      => fn() => $userIsLoggedIn ? auth()->user()->only(
                    [
                        'id',
                        'name',
                        'email',
                        'role_id',
                        'avatar',
                    ]
                ) : null,
                'capabilities'   => fn() => $this->accessControlService->getCommonCapabilities(),
                'flash.success'  => fn() => $request->session()->get('success'),
                'flash.error'    => fn() => $request->session()->get('error'),
                'flash.status'   => fn() => $request->session()->get('status'),
            ],
        ];
        $sidebarGuiResources = [];
        $sidebarGuiTools = [];
        foreach (config('sciki.resource_providers') as $provider) {
            /** @var ModuleProvider $provider */
            $provider = app($provider);
            $moduleShare = $provider->inertiaShare();
            if ($moduleShare) {
                $shared[] = $moduleShare;
            }
            $resources = $provider->exposesGuiResources();
            if ($resources) {
                $sidebarGuiResources[] = array_map(static fn(ScikiSidebarLink $res) => $res->toArray(), $resources);
            }
            $tools = $provider->exposesGuiTools();
            if ($tools) {
                $sidebarGuiTools[] = array_map(static fn(ScikiSidebarLink $res) => $res->toArray(), $tools);
            }
        }
        $shared[] = [
            'gui.resources' => array_merge(...$sidebarGuiResources),
            'gui.tools'     => array_merge(...$sidebarGuiTools),
        ];

        return array_merge(...$shared);
    }
}
