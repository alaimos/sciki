<?php

namespace App\Http\Controllers\Editor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Editor\EditMediaPropertiesRequest;
use App\Http\Requests\Editor\EditPageRequest;
use App\Http\Requests\Editor\StorePageRequest;
use App\Http\Requests\Editor\UploadMediaRequest;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class PageController extends Controller
{

    public const DEFAULT_CONTENT = <<<CONTENT
# %s
CONTENT;

    /**
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function store(StorePageRequest $request): RedirectResponse
    {
        $this->authorize('create', Page::class);

        $validatedRequestData = $request->validated();
        $pageTitle = $validatedRequestData['title'];

        $newPage = Page::create(
            [
                'title'         => $pageTitle,
                'content'       => sprintf(self::DEFAULT_CONTENT, $pageTitle),
                'user_id'       => auth()->id(),
                'draft'         => true,
            ]
        );

        return redirect()->route('page.edit', $newPage);
    }


    /**
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function edit(Page $page): Response
    {
        $this->authorize('update', $page);
        $page->load(['simulation', 'media']);

        return Inertia::render(
            'Pages/Edit',
            [
                'page'           => $page,
                'formatted_tags' => $page->formatted_tags,
                'simulation'     => $page->simulation,
                'media'          => $page->formatted_media,
            ]
        );
    }

    /**
     * @throws \Illuminate\Auth\Access\AuthorizationException
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
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function publish(Page $page): RedirectResponse
    {
        $this->authorize('update', $page);
        $page->update(['draft' => false]);

        return redirect()->route('wiki.show', $page)->with('success', 'Page is now public!');
    }

    /**
     * @throws \Illuminate\Auth\Access\AuthorizationException
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
     * @param  \App\Models\Page  $page
     *
     * @return \Illuminate\Http\RedirectResponse
     * @throws \Illuminate\Auth\Access\AuthorizationException
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
