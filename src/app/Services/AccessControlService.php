<?php
/** @noinspection NonSecureUniqidUsageInspection */

namespace App\Services;

use App\Models\Page;
use Illuminate\Contracts\Auth\Authenticatable;
use JetBrains\PhpStorm\ArrayShape;

class AccessControlService
{

    private Authenticatable|null $currentUser;

    public function __construct()
    {
        $this->currentUser = auth()->user();
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

    #[ArrayShape(['pages' => "bool[]"])] public function getCommonCapabilities(): array
    {
        return [
            'pages' => $this->getPagesCapabilities(),
        ];
    }

}
