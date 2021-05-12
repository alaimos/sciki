<?php

namespace App\Services;

use App\Http\Resources\PageResource;
use App\Http\Resources\TagResource;
use App\Models\Page;
use App\Models\Tag;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SearchService
{

    private string $query;

    public function __construct(string $query)
    {
        abort_if(empty($query), 422, 'Search query should not be empty');
        $this->query = $query;
    }

    private function searchPages(): AnonymousResourceCollection
    {
        return PageResource::collection(Page::search($this->query)->paginate(pageName: 'pages_page'));
    }

    private function searchTags(): AnonymousResourceCollection
    {
        return TagResource::collection(Tag::search($this->query)->paginate(pageName: 'tags_page'));
    }

    public function search(): array
    {
        return [
            'query' => $this->query,
            'pages' => fn() => $this->searchPages(),
            'tags'  => fn() => $this->searchTags(),
            'can'   => [
                'create' => auth()->check() && auth()->user()->can('create', Page::class),
            ],
        ];
    }


}
