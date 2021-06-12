<?php

namespace App\Http\Resources;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{

    /**
     * @param Request $request
     *
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'comment'             => $this->comment,
            'created_at'          => $this->created_at,
            'readable_created_at' => $this->readable_created_at,
            'user'                => $this->user->only(
                [
                    'id',
                    'name',
                    'email',
                    'role_id',
                    'avatar',
                ]
            ),
            'current_user_vote'   => $this->current_user_vote,
            'votes_sum_vote'      => (int)($this->votes_sum_vote ?? $this->total_vote),
            'can_delete'          => auth()->check() && (
                    $this->user_id === auth()->id() ||
                    auth()->user()->role_id === Role::ADMIN
                )
        ];
    }
}
