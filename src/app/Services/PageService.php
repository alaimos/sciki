<?php
/** @noinspection NonSecureUniqidUsageInspection */

namespace App\Services;

use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as LaravelHttpResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use League\CommonMark\CommonMarkConverter;
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
    private bool $userCanDeletePage = false;

    public function __construct(string $page)
    {
        $this->slug = $page;
        $this->findRequestedPage();
        $this->checkUserAuthorization();
    }

    private function findRequestedPage(): void
    {
        $this->model = Page::whereSlug($this->slug)->with('user')->first();
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
        $this->userCanDeletePage = $this->userIsLoggedIn && !$this->pageNotFound && auth()->user()->can('delete', $this->model);
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
                    'delete' => $this->userCanDeletePage,
                ],
            ]
        );
    }

    private function parsePageContent(): array
    {
        $originalContent = $this->model->content;
        //@todo
        $converter = new CommonMarkConverter();

        return [
            [
                'key'       => uniqid(more_entropy: true),
                'component' => 'Html',
                'props'     => [
                    'content' => $converter->convertToHtml($originalContent),
                ],
            ],
            [
                'key'       => uniqid(more_entropy: true),
                'component' => 'Plugins/Test',
                'props'     => [
                    'hello' => 'World!',
                ],
            ],
            [
                'key'       => uniqid(more_entropy: true),
                'component' => 'Plugins/Pippo',
                'props'     => [
                    'hello' => 'World!',
                ],
            ],
            [
                'key'   => uniqid(more_entropy: true),
                'props' => [
                    'hello' => 'World!',
                ],
            ],
        ];
    }

    private function renderExistingPage(): Response
    {
        return Inertia::render(
            'Wiki/Page',
            [
                'slug'    => $this->slug,
                'page'    => $this->model,
                'content' => $this->parsePageContent(),
                'draft'   => $this->userIsLoggedIn && $this->pageIsDraft,
                'can'     => [
                    'create' => $this->userCanCreateNewPage,
                    'update' => $this->userCanUpdatePage,
                    'delete' => $this->userCanDeletePage,
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
