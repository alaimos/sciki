<?php


namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController
{

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
