<?php
/** @noinspection NestedTernaryOperatorInspection */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{

    protected $fillable = [
        'user_id',
        'comment',
        'ip_address',
        'user_agent',
    ];

    public function votes(): HasMany
    {
        return $this->hasMany(CommentVote::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vote(int $vote = 0): void
    {
        $vote = ($vote > 0) ? +1 : (($vote < 0) ? -1 : 0);
        $user = auth()->user();
        if (!$user) {
            return;
        }
        $voteModel = $this->votes()->firstOrCreate(
            [
                'user_id' => $user->getAuthIdentifier(),
            ],
            [
                'vote' => 0
            ]
        );
        $voteModel->update(['vote' => $vote]);
    }

    public function getCurrentUserVoteAttribute(): ?int
    {
        $user = auth()->user();
        if (!$user) {
            return null;
        }
        $vote = $this->votes()->where('user_id', $user->getAuthIdentifier())->first();

        return $vote->vote ?? null;
    }

}
