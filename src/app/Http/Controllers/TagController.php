<?php

namespace App\Http\Controllers;

use App\Http\Resources\PageResource;
use App\Http\Resources\TagResource;
use App\Models\Page;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class TagController
{

    public function show(Tag $tag): InertiaResponse
    {
        return Inertia::render(
            'Wiki/SearchByTag',
            [
                'tag'   => TagResource::make($tag),
                'pages' => fn() => PageResource::collection(Page::withAllTags([$tag])->paginate()),
            ]
        );
    }

    public function typeahead(Request $request): JsonResponse
    {
        $searchQuery = $request->get('query');

        $searchResults = [];
        if (!empty($searchQuery)) {
            $searchResults = Tag::search($searchQuery)->take(10)->get()->pluck('formatted_name');
        }

        return response()->json($searchResults);
    }

}
