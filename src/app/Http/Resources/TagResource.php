<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TagResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     *
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'id'   => $this->id,
            'tag'  => $this->formatted_name,
            'name' => $this->name,
            'type' => $this->type,
        ];
    }
}
