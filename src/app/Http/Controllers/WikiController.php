<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Tag;
use App\Services\PageService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response as BaseResponse;
use Illuminate\Http\Request;

class WikiController extends Controller
{

    public function index(): InertiaResponse
    {
        return Inertia::render('Wiki/Index');
    }

    public function show(Request $request, string $page): BaseResponse
    {
        $pageService = new PageService($page);

        return $pageService->render($request);
    }

    public function typeahead(Request $request): JsonResponse
    {
        $searchQuery = $request->get('query');

        $searchResults = [];
        if (!empty($searchQuery)) {
            $searchResults = Page::search($searchQuery)->take(10)->get()->map(
                fn(Page $p) => [
                    'id'    => $p->slug,
                    'label' => $p->title,
                ]
            );
        }

        return response()->json($searchResults);
    }

}
