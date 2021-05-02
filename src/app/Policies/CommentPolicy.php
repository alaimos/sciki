<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CommentPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any comments.
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
     * Determine whether the user can view the comment.
     *
     * @param  User  $user
     * @param  Comment  $comment
     *
     * @return bool
     */
    public function view(User $user, Comment $comment): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create comments.
     *
     * @param  User  $user
     *
     * @return bool
     */
    public function create(User $user): bool
    {
        return $user->role_id >= Role::USER;
    }

    /**
     * Determine whether the user can update the comment.
     *
     * @param  User  $user
     * @param  Comment  $comment
     *
     * @return bool
     */
    public function update(User $user, Comment $comment): bool
    {
        return $user->role_id === Role::ADMIN || $user->id === $comment->user_id;
    }

    /**
     * Determine whether the user can delete the comment.
     *
     * @param  User  $user
     * @param  Comment  $comment
     *
     * @return bool
     */
    public function delete(User $user, Comment $comment): bool
    {
        return $user->role_id === Role::ADMIN || $user->id === $comment->user_id;
    }

    /**
     * Determine whether the user can restore the comment.
     *
     * @param  User  $user
     * @param  Comment  $comment
     *
     * @return bool
     */
    public function restore(User $user, Comment $comment): bool
    {
        return $user->role_id === Role::ADMIN || $user->id === $comment->user_id;
    }

    /**
     * Determine whether the user can permanently delete the comment.
     *
     * @param  User  $user
     * @param  Comment  $comment
     *
     * @return bool
     */
    public function forceDelete(User $user, Comment $comment): bool
    {
        return $user->role_id === Role::ADMIN || $user->id === $comment->user_id;
    }
}
