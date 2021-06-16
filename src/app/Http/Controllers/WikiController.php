<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Models\Page;
use App\Services\HomepageService;
use App\Services\PageService;
use App\Services\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response as BaseResponse;

class WikiController extends Controller
{

    public function index(): InertiaResponse
    {
        return (new HomepageService())->render();
    }

    public function show(Request $request, string $page): BaseResponse
    {
        $pageService = new PageService($page);

        return $pageService->render($request);
    }

    public function showComments(string $page): InertiaResponse
    {
        $pageService = new PageService($page);

        return $pageService->renderComments();
    }

    public function storeComment(StoreCommentRequest $request, Page $page): RedirectResponse
    {
        $data = $request->validated();
        $page->comment($data['comment']);

        return redirect()->route('wiki.comments', $page)->with('success', 'Comment posted successfully!');
    }

    public function typeahead(Request $request): JsonResponse
    {
        $searchQuery = $request->get('query');

        $searchResults = [];
        if (!empty($searchQuery)) {
            $searchResults = Page::where('title', 'like', '%' . $searchQuery . '%')
                                 ->take(10)
                                 ->get()
                                 ->map(
                                     fn(Page $p) => [
                                         'id'    => $p->slug,
                                         'label' => $p->title,
                                         'page'  => true,
                                     ]
                                 );
        }
        $searchResults[] = [
            'id'    => $searchQuery,
            'label' => sprintf('Search for: %s', $searchQuery),
            'page'  => false,
        ];

        return response()->json($searchResults);
    }

    public function search(Request $request): InertiaResponse
    {
        return Inertia::render(
            'Wiki/Search',
            (new SearchService($request->get('query')))->search()
        );
    }

}
