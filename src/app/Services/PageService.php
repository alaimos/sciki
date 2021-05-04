<?php

namespace App\Services;

use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as LaravelHttpResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyHttpResponse;

class PageService
{

    private string $slug;
    private ?Page $model = null;
    private bool $pageNotFound = true;
    private bool $pageIsDraft = false;
    private bool $userIsLoggedIn = false;
    private bool $userCanCreateNewPage = false;
    private bool $userCanUpdatePage = false;

    public function __construct(string $page)
    {
        $this->slug = $page;
        $this->findRequestedPage();
        $this->checkUserAuthorization();
    }

    private function findRequestedPage(): void
    {
        $this->model = Page::whereSlug($this->slug)->first();
        $this->pageNotFound = $this->model === null;
        $this->pageIsDraft = !$this->pageNotFound && $this->model->draft;
    }

    private function checkUserAuthorization(): void
    {
        $this->userIsLoggedIn = auth()->check();
        $this->userCanCreateNewPage = $this->userIsLoggedIn && auth()->user()->can('create', Page::class);
        $this->userCanUpdatePage = $this->userIsLoggedIn && (
                ($this->pageNotFound && $this->userCanCreateNewPage) ||
                (!$this->pageNotFound && auth()->user()->can('update', $this->model))
            );
    }

    private function getTitleFromSlug(): string
    {
        return Str::title(str_replace(['-', '_'], ' ', $this->slug));
    }

    private function renderPageNotFound(): Response
    {
        return Inertia::render(
            'Wiki/PageNotFound',
            [
                'slug'  => $this->slug,
                'title' => $this->getTitleFromSlug(),
                'draft' => $this->userIsLoggedIn && $this->pageIsDraft,
                'can'   => [
                    'create' => $this->userCanCreateNewPage,
                    'update' => $this->userCanUpdatePage,
                ],
            ]
        );
    }

    private function renderExistingPage(): Response
    {
        return Inertia::render(
            'Wiki/Page',
            [
                'slug'    => $this->slug,
                'page'    => $this->model,
                'content' => [
                    //todo
                    '<strong>Hello World</strong>',
                ],
                'draft'   => $this->userIsLoggedIn && $this->pageIsDraft,
                'can'     => [
                    'create' => $this->userCanCreateNewPage,
                    'update' => $this->userCanUpdatePage,
                ],
            ]
        );
    }

    public function render(Request $request): LaravelHttpResponse|JsonResponse|SymfonyHttpResponse
    {
        if ($this->pageNotFound || ($this->pageIsDraft &&
                (!$this->userIsLoggedIn || !auth()->user()->can('update', $this->model))
            )) {
            $inertiaResponse = $this->renderPageNotFound();
            $changeStatusCode = true;
        } else {
            $inertiaResponse = $this->renderExistingPage();
            $changeStatusCode = false;
        }
        $response = $inertiaResponse->toResponse($request);
        if ($changeStatusCode) {
            $response->setStatusCode(404);
        }

        return $response;
    }


}
