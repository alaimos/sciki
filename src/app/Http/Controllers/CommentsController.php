<?php


namespace App\Http\Controllers;


use App\Http\Requests\VoteCommentRequest;
use App\Models\Comment;
use Illuminate\Http\JsonResponse;

class CommentsController
{

    public function vote(VoteCommentRequest $request, Comment $comment): JsonResponse
    {
        $data = $request->validated();
        $vote = (int)$data['vote'];
        $currentUserVote = $comment->current_user_vote;
        if ($currentUserVote === null || $currentUserVote === 0) {
            $comment->vote($vote);
        } else {
            $comment->vote(($currentUserVote === $vote) ? 0 : $vote);
        }
        return response()->json(
            [
                'current_user_vote' => $comment->current_user_vote,
                'total_votes'       => $comment->votes()->sum('vote'),
            ]
        );
    }

}
