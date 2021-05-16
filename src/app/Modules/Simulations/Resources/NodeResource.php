<?php

namespace App\Modules\Simulations\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class NodeResource extends JsonResource
{

    /**
     * @param  \Illuminate\Http\Request  $request
     *
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'id'        => $this->id,
            'accession' => $this->accession,
            'name'      => $this->name,
            'aliases'   => $this->aliases,
        ];
    }
}
