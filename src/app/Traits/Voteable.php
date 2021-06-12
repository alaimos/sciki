<?php
/** @noinspection NestedTernaryOperatorInspection */

namespace App\Traits;

use App\Models\Vote;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait Voteable
{
    public function votes(): MorphMany
    {
        return $this->morphMany(Vote::class, 'voteable');
    }

    public function vote(int $vote = 0): void
    {
        $user = auth()->user();
        if (!$user) {
            return;
        }
        $vote = ($vote > 0) ? +1 : (($vote < 0) ? -1 : 0);
        $currentVote = $this->getCurrentUserVoteAttribute();
        $voteModel = $this->votes()->firstOrCreate(
            [
                'user_id' => $user->getAuthIdentifier(),
            ],
            [
                'vote' => 0
            ]
        );
        if ($currentVote === null || $currentVote === 0) {
            $updatedVote = $vote;
        } else {
            $updatedVote = ($currentVote === $vote) ? 0 : $vote;
        }
        $voteModel->update(['vote' => $updatedVote]);
    }

    public function getTotalVoteAttribute(): int
    {
        return $this->votes()->sum('vote');
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
