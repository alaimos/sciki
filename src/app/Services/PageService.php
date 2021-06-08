<?php
/** @noinspection NonSecureUniqidUsageInspection */

namespace App\Services;

use App\CommonMark\SciKiExtension\SciKiExtension;
use App\CommonMark\SciKiExtension\ScikiFencedCodeRenderer;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as LaravelHttpResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use League\CommonMark\Environment;
use League\CommonMark\Extension\Autolink\AutolinkExtension;
use League\CommonMark\Extension\Footnote\FootnoteExtension;
use League\CommonMark\Extension\GithubFlavoredMarkdownExtension;
use League\CommonMark\Extension\HeadingPermalink\HeadingPermalinkExtension;
use League\CommonMark\Extension\SmartPunct\SmartPunctExtension;
use League\CommonMark\Extension\TableOfContents\TableOfContentsExtension;
use League\CommonMark\MarkdownConverter;
use Symfony\Component\HttpFoundation\Response as SymfonyHttpResponse;
use Venturecraft\Revisionable\Revision;

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
        $this->model = Page::whereSlug($this->slug)->with(['user', 'media', 'tags'])->first();
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
        $this->userCanDeletePage = $this->userIsLoggedIn && !$this->pageNotFound && auth()->user()->can(
                'delete',
                $this->model
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
                    'delete' => $this->userCanDeletePage,
                ],
            ]
        );
    }

    private function makeMarkdownParser(): MarkdownConverter
    {
        $environment = Environment::createCommonMarkEnvironment();
        $environment->addExtension(new GithubFlavoredMarkdownExtension());
        $environment->addExtension(new AutolinkExtension());
        $environment->addExtension(new FootnoteExtension());
        $environment->addExtension(new HeadingPermalinkExtension());
        $environment->addExtension(new TableOfContentsExtension());
        $environment->addExtension(new SmartPunctExtension());
        $environment->addExtension(new SciKiExtension());
        $environment->mergeConfig(
            [
                'sciki'             => [
                    'current_page' => $this->model,
                ],
                'heading_permalink' => [
                    'insert' => 'after',
                ],
                'table_of_contents' => [
                    'position'    => 'placeholder',
                    'style'       => 'ordered',
                    'placeholder' => '[TOC]',
                ],
            ]
        );

        $converter = new MarkdownConverter($environment);

        return $converter;
    }

    private function parsePageContent(): array
    {
        ScikiFencedCodeRenderer::clearDetectedBlocks();
        $originalContent = $this->model->content;
        $converter = $this->makeMarkdownParser();
        $convertedContent = $converter->convertToHtml($originalContent);
        $dividedBlocks = preg_split(
            ScikiFencedCodeRenderer::SCIKI_BLOCK_REGEXP,
            $convertedContent,
            -1,
            PREG_SPLIT_DELIM_CAPTURE
        );
        $reactContentArray = [];
        foreach ($dividedBlocks as $i => $content) {
            // Even-indexed elements are things before/after the SciKi plugin blocks
            if ($i % 2 === 0) {
                $reactContentArray[] = [
                    'key'       => Str::uuid()->toString(),
                    'component' => 'Html',
                    'props'     => [
                        'content' => $content,
                    ],
                ];
            } elseif (($block = ScikiFencedCodeRenderer::getDetectedBlock($content)) !== null) {
                $reactContentArray[] = [
                    'key'       => Str::uuid()->toString(),
                    'component' => $block['component'],
                    'props'     => $block['props'],
                ];
            }
        }
        ScikiFencedCodeRenderer::clearDetectedBlocks();

        return $reactContentArray;
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

    public function renderRevisions(): Response
    {
        abort_if(
            $this->pageNotFound || ($this->pageIsDraft &&
                (!$this->userIsLoggedIn || !auth()->user()->can('update', $this->model))
            ),
            404
        );
        /** @var Collection $history */
        $history = $this->model->revisionHistory;
        $history = $history->whereIn('key', ['title', 'content'])
                           ->sortByDesc('created_at')
                           ->map(
                               static function (Revision $revision) {
                                   return [
                                       'id'          => $revision->id,
                                       'description' => ($revision->key === 'title') ?
                                           sprintf(
                                               'Title updated from "%s" to "%s"',
                                               $revision->old_value,
                                               $revision->new_value
                                           ) :
                                           sprintf(
                                               'Content updated (%d characters) (%+d)',
                                               strlen($revision->new_value),
                                               strlen($revision->new_value) - strlen($revision->old_value)
                                           ),
                                       'responsible' => $revision->userResponsible()->name,
                                       'created_at'  => $revision->created_at->diffForHumans(),
                                   ];
                               }
                           )->values();

        return Inertia::render(
            'Wiki/PageHistory',
            [
                'slug'    => $this->slug,
                'title'   => $this->model->title,
                'history' => $history,
                'draft'   => $this->userIsLoggedIn && $this->pageIsDraft,
                'can'     => [
                    'create' => $this->userCanCreateNewPage,
                    'update' => $this->userCanUpdatePage,
                    'delete' => $this->userCanDeletePage,
                ],
            ]
        );
    }


}
