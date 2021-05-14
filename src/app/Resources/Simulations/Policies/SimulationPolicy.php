<?php

namespace App\Resources\Simulations\Policies;

use App\Models\Role;
use App\Models\Simulation;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SimulationPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any simulations.
     *
     * @param  User  $user
     *
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the simulation.
     *
     * @param  User  $user
     * @param  Simulation  $simulation
     *
     * @return bool
     */
    public function view(User $user, Simulation $simulation): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create simulations.
     *
     * @param  User  $user
     *
     * @return bool
     */
    public function create(User $user): bool
    {
        return $user->role_id >= Role::EDITOR;
    }

    /**
     * Determine whether the user can update the simulation.
     *
     * @param  User  $user
     * @param  Simulation  $simulation
     *
     * @return bool
     */
    public function update(User $user, Simulation $simulation): bool
    {
        return $user->role_id === Role::ADMIN || $user->id === $simulation->user_id;
    }

    /**
     * Determine whether the user can delete the simulation.
     *
     * @param  User  $user
     * @param  Simulation  $simulation
     *
     * @return bool
     */
    public function delete(User $user, Simulation $simulation): bool
    {
        return $user->role_id === Role::ADMIN || $user->id === $simulation->user_id;
    }

    /**
     * Determine whether the user can restore the simulation.
     *
     * @param  User  $user
     * @param  Simulation  $simulation
     *
     * @return bool
     */
    public function restore(User $user, Simulation $simulation): bool
    {
        return $user->role_id === Role::ADMIN || $user->id === $simulation->user_id;
    }

    /**
     * Determine whether the user can permanently delete the simulation.
     *
     * @param  User  $user
     * @param  Simulation  $simulation
     *
     * @return bool
     */
    public function forceDelete(User $user, Simulation $simulation): bool
    {
        return $user->role_id === Role::ADMIN;
    }
}
