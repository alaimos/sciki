<?php


namespace App\Models;

use Laravel\Scout\Searchable;
use Spatie\Tags\Tag as SpatieTagModel;


class Tag extends SpatieTagModel
{

    use Searchable;

    public function searchableAs(): string
    {
        return 'tags_index';
    }

    public function toSearchableArray(): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'type'           => $this->type,
            'formatted_name' => $this->formatted_name,
        ];
    }

    public function getFormattedNameAttribute(): string
    {
        return $this->type . ': ' . $this->name;
    }


}
