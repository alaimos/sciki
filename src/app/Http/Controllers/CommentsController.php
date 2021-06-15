<?php


namespace App\Http\Controllers;


use App\Http\Requests\VoteRequest;
use App\Models\Comment;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class CommentsController
{

    public function vote(VoteRequest $request, Comment $comment): JsonResponse
    {
        $data = $request->validated();
        $comment->vote((int)$data['vote']);
        return response()->json(
            [
                'current_user_vote' => $comment->current_user_vote,
                'total_votes'       => $comment->total_vote,
            ]
        );
    }

    public function destroy(Comment $comment): JsonResponse
    {
        abort_unless(
            auth()->check() && ($comment->user_id === auth()->id() || auth()->user()->role_id === Role::ADMIN),
            403,
            'You are not allowed to perform this action'
        );
        $comment->votes()->delete();
        $comment->delete();
        return response()->json(
            [
                'id' => $comment->id,
            ]
        );
    }

}
