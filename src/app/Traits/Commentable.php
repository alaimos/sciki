<?php

namespace App\Traits;

use App\Models\Comment;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait Commentable
{
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable')
                    ->with('user')
                    ->withSum('votes', 'vote');
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

    private function newComment(array $data): Comment
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
