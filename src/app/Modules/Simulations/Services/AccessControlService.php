<?php

namespace App\Modules\Simulations\Services;

use App\Modules\Abstract\Services\AccessControlService as AbstractAccessControlService;
use App\Modules\Simulations\Models\Simulation;
use Illuminate\Database\Eloquent\Model;
use JetBrains\PhpStorm\ArrayShape;

class AccessControlService extends AbstractAccessControlService
{

    public function getCapabilities(Model|string|null $model = null): ?array
    {
        if ($model === Simulation::class || $model instanceof Simulation) {
            $modelIsObject = $model instanceof Simulation;
            $userIsLoggedIn = $this->currentUser !== null;
            $userCanView = $modelIsObject && ((
                        $userIsLoggedIn && $this->currentUser->can('view', $model)
                    ) ||
                    $model->public
                );
            $userCanCreate = $userIsLoggedIn && $this->currentUser->can('create', $model);
            $userCanEdit = $userIsLoggedIn && $modelIsObject && $this->currentUser->can('update', $model);
            $userCanDelete = $userIsLoggedIn && $modelIsObject && $this->currentUser->can('delete', $model);

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

        return null;
    }

    #[ArrayShape(['simulations' => "bool[]"])] public function getCommonCapabilities(): array
    {
        return [
            'simulations' => $this->getCapabilities(Simulation::class),
        ];
    }
}
