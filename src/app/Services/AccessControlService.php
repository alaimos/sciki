<?php
/** @noinspection NonSecureUniqidUsageInspection */

namespace App\Services;

use App\Models\Page;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use JetBrains\PhpStorm\ArrayShape;

class AccessControlService
{

    private Authenticatable|null $currentUser;

    /**
     * @var \App\Modules\Abstract\Services\AccessControlService[]
     */
    private array $modules;

    public function __construct()
    {
        $this->currentUser = auth()->user();
        foreach (config('sciki.resource_providers') as $provider) {
            $service = app($provider)->accessControlService();
            if ($service) {
                $this->modules[] = $service;
            }
        }
    }

    #[ArrayShape([
        'list'            => "bool",
        'view'            => "bool",
        'comment'         => "bool",
        'perform_actions' => "bool",
        'create'          => "bool",
        'update'          => "bool",
        'delete'          => "bool",
    ])] public function getPagesCapabilities(
        ?Page $page = null
    ): array {
        $userIsLoggedIn = $this->currentUser !== null;
        $pageExists = $page !== null && $page->exists;
        $userCanView = $pageExists && (!$page->draft || ($userIsLoggedIn && $this->currentUser->can('view', $page)));
        $userCanCreate = $userIsLoggedIn && $this->currentUser->can('create', Page::class);
        $userCanEdit = $userIsLoggedIn && (
                (!$pageExists && $userCanCreate) ||
                ($pageExists && $this->currentUser->can('update', $page))
            );
        $userCanDelete = $userIsLoggedIn && $pageExists && $this->currentUser->can('delete', $page);

        return [
            'list'            => true,
            'view'            => $userCanView,
            'comment'         => $userIsLoggedIn,
            'perform_actions' => $userCanCreate || $userCanEdit || $userCanDelete,
            'create'          => $userCanCreate,
            'update'          => $userCanEdit,
            'delete'          => $userCanDelete,
        ];
    }

    public function getCapabilities(Model|string|null $model = null): ?array
    {
        foreach ($this->modules as $moduleACS) {
            $capabilities = $moduleACS->getCapabilities($model);
            if ($capabilities !== null) {
                return $capabilities;
            }
        }

        return null;
    }

    #[ArrayShape(['pages' => "bool[]"])] public function getCommonCapabilities(): array
    {
        $capabilities = [
            [
                'pages' => $this->getPagesCapabilities(),
            ],
        ];
        foreach ($this->modules as $moduleACS) {
            $capabilities[] = $moduleACS->getCommonCapabilities();
        }

        return array_merge(...$capabilities);
    }

}
