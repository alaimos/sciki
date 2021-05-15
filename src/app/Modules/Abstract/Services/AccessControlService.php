<?php

namespace App\Modules\Abstract\Services;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;

abstract class AccessControlService
{

    protected Authenticatable|null $currentUser;

    public function __construct()
    {
        $this->currentUser = auth()->user();
    }

    /**
     * Returns the list of actions that the current user can perform on a model.
     * The $model parameter can be a model instance or the name of a model class or null
     * The model should return an array of actions if this module can handle the model class
     * otherwise null must be returned. The array of action contains a string key representing
     * the action and a boolean value that indicates whether the user can perform the action.
     * Common actions are: list, comment, perform_actions, create, update, delete.
     *
     * @param  \Illuminate\Database\Eloquent\Model|string|null  $model
     *
     * @return array|null
     */
    abstract public function getCapabilities(
        Model|string|null $model = null
    ): ?array;

    /**
     * Returns an array of actions lists for all the models that can be handled
     * by this module. For each element of the array, the key represents
     * a mnemonic used to get the contained array of capabilities.
     *
     * @return array
     */
    abstract public function getCommonCapabilities(): array;

}
