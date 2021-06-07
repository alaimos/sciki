<?php

namespace App\Http\Controllers\Editor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Editor\EditPageRequest;
use App\Http\Requests\Editor\StorePageRequest;
use App\Models\Page;
use App\Services\TablesService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PageController extends Controller
{

    public const DEFAULT_CONTENT = <<<CONTENT
# %s
CONTENT;

    public function index(): InertiaResponse
    {
        $this->authorize('viewTable', Page::class);

        return Inertia::render('Pages/Index');
    }

    public function indexTable(Request $request): JsonResponse
    {
        $this->authorize('viewTable', Page::class);

        return response()->json((new TablesService())->handlePagesTableRequest($request));
    }

    /**
     * @throws AuthorizationException
     */
    public function store(StorePageRequest $request): RedirectResponse
    {
        $this->authorize('create', Page::class);

        $validatedRequestData = $request->validated();
        $pageTitle = $validatedRequestData['title'];

        $newPage = Page::create(
            [
                'title'   => $pageTitle,
                'content' => sprintf(self::DEFAULT_CONTENT, $pageTitle),
                'user_id' => auth()->id(),
                'draft'   => true,
            ]
        );

        return redirect()->route('page.edit', $newPage);
    }


    /**
     * @throws AuthorizationException
     */
    public function edit(Page $page): InertiaResponse
    {
        $this->authorize('update', $page);
        $page->load(['media']);

        return Inertia::render(
            'Pages/Edit',
            [
                'page'           => $page,
                'formatted_tags' => $page->formatted_tags,
                'media'          => $page->formatted_media,
            ]
        );
    }

    /**
     * @throws AuthorizationException
     */
    public function update(EditPageRequest $request, Page $page): RedirectResponse
    {
        $this->authorize('update', $page);

        $data = $request->validated();

        $page->update(
            [
                'title'   => $data['title'],
                'content' => $data['content'],
            ]
        );

        $page->syncFormattedTags($data['tags'])
             ->deleteMediaByUuid($data['deletedMedia']);

        return redirect()->route('wiki.show', $page)->with('success', 'Page updated!');
    }

    /**
     * @throws AuthorizationException
     */
    public function publish(Page $page): RedirectResponse
    {
        $this->authorize('update', $page);
        $page->update(['draft' => false]);

        return redirect()->route('wiki.show', $page)->with('success', 'Page is now public!');
    }

    /**
     * @throws AuthorizationException
     */
    public function draft(Page $page): RedirectResponse
    {
        $this->authorize('update', $page);
        $page->update(['draft' => true]);

        return redirect()->route('page.edit', $page)->with('success', 'Page has been set as a draft!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Page $page
     *
     * @return RedirectResponse
     * @throws AuthorizationException
     */
    public function destroy(Page $page): RedirectResponse
    {
        $this->authorize('delete', $page);

        $page->delete();

        return redirect()
            ->route('wiki.index')
            ->with('success', sprintf('The page %s has been deleted', $page->title));
    }

}
