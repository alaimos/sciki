<?php

namespace App\Traits;

use App\Models\Comment;
use Illuminate\Contracts\Auth\Authenticatable;

trait Commentable
{
    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function comment(string $comment): Comment
    {
        if (auth()->check()) {
            return $this->commentAs(auth()->user(), $comment);
        }

        return $this->newComment(['comment' => $comment]);
    }

    public function commentAs(Authenticatable $user, string $comment): Comment
    {
        return $this->newComment(
            [
                'comment' => $comment,
                'user_id' => $user->getAuthIdentifier(),
            ]
        );
    }

    private function newComment(array $data)
    {
        return $this->comments()->create(
            array_merge(
                $data,
                [
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]
            )
        );
    }
}
