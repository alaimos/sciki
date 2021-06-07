<?php

namespace App\Policies;

use App\Models\Page;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class PagePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any pages.
     *
     * @param User $user
     *
     * @return bool
     */
    public function viewTable(User $user): bool
    {
        return $user->role_id === Role::EDITOR || $user->role_id === Role::ADMIN;
    }

    /**
     * Determine whether the user can view the page.
     *
     * @param User $user
     * @param Page $page
     *
     * @return bool
     */
    public function view(User $user, Page $page): bool
    {
        return (
            !$page->draft ||
            $user->id === $page->user_id ||
            $user->role_id === Role::ADMIN
        );
    }

    /**
     * Determine whether the user can create pages.
     *
     * @param User $user
     *
     * @return \Illuminate\Auth\Access\Response
     */
    public function create(User $user): Response
    {
        return $user->role_id >= Role::EDITOR ? $this->allow() : $this->deny(
            'You are not allowed to create a new page'
        );
    }

    /**
     * Determine whether the user can update the page.
     *
     * @param User $user
     * @param Page $page
     *
     * @return \Illuminate\Auth\Access\Response
     */
    public function update(User $user, Page $page): Response
    {
        $isAdmin = $user->role_id === Role::ADMIN;
        $isAllowedWhenPageIsDraft = $page->draft && $user->id === $page->user_id;
        $isAllowedWhenPageIsNotDraft = !$page->draft && $user->role_id >= Role::EDITOR;
        $message = (!$isAllowedWhenPageIsDraft) ? 'You are not allowed to update a draft of another user' : 'You are not allowed to update this page';

        return ($isAdmin || $isAllowedWhenPageIsDraft || $isAllowedWhenPageIsNotDraft) ? $this->allow() : $this->deny(
            $message
        );
    }

    /**
     * Determine whether the user can delete the page.
     *
     * @param User $user
     * @param Page $page
     *
     * @return \Illuminate\Auth\Access\Response
     */
    public function delete(User $user, Page $page): Response
    {
        return $this->update($user, $page);
    }

    /**
     * Determine whether the user can restore the page.
     *
     * @param User $user
     * @param Page $page
     *
     * @return \Illuminate\Auth\Access\Response
     */
    public function restore(User $user, Page $page): Response
    {
        return $this->update($user, $page);
    }

    /**
     * Determine whether the user can permanently delete the page.
     *
     * @param User $user
     * @param Page $page
     *
     * @return bool
     */
    public function forceDelete(User $user, Page $page): bool
    {
        return $user->role_id === Role::ADMIN;
    }
}
