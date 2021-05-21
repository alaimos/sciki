<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PageResource extends JsonResource
{

    /**
     * @param Request $request
     *
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'id'      => $this->id,
            'slug'    => $this->slug,
            'title'   => $this->title,
            'content' => $this->content,
            'tags'    => $this->formatted_tags,
        ];
    }
}
