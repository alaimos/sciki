<?php

namespace App\Http\Controllers\Editor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Editor\EditMediaPropertiesRequest;
use App\Http\Requests\Editor\UploadMediaRequest;
use App\Models\Page;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\MediaLibrary\MediaCollections\Exceptions\FileDoesNotExist;
use Spatie\MediaLibrary\MediaCollections\Exceptions\FileIsTooBig;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MediaController extends Controller
{

    /**
     * Upload a new media
     *
     * @param UploadMediaRequest $request
     * @param Page $page
     *
     * @return JsonResponse
     * @throws AuthorizationException
     * @throws FileDoesNotExist
     * @throws FileIsTooBig
     */
    public function upload(UploadMediaRequest $request, Page $page): JsonResponse
    {
        $this->authorize('update', $page);

        $data = $request->validated();

        $newMedia = $page->addMedia($request->file('file'))
                         ->usingFileName($data['name'])
                         ->withResponsiveImages()
                         ->toMediaCollection();

        return response()->json(
            [
                'ok'    => true,
                'media' => $page->formatMedia($newMedia),
            ]
        );
    }

    /**
     * Returns a media as a stream
     *
     * @param Request $request
     * @param string $media
     *
     * @return SymfonyResponse|StreamedResponse
     * @throws AuthorizationException
     */
    public function image(
        Request $request,
        string $media
    ): SymfonyResponse|StreamedResponse {
        $mediaModel = Media::whereUuid($media)->firstOrFail();

        $this->authorize('update', $mediaModel->model);

        return $mediaModel->toResponse($request);
    }

    /**
     * Update the title and legend of a media
     *
     * @param EditMediaPropertiesRequest $request
     * @param Page $page
     * @param string $media
     *
     * @return JsonResponse
     * @throws AuthorizationException
     */
    public function update(EditMediaPropertiesRequest $request, Page $page, string $media): JsonResponse
    {
        $this->authorize('update', $page);

        $data = $request->validated();

        $mediaModel = $page->media()->whereUuid($media)->firstOrFail();

        $mediaModel->setCustomProperty('title', $data['title'])
                   ->setCustomProperty('legend', $data['legend'])
                   ->save();

        return response()->json(
            [
                'ok'    => true,
                'media' => $page->formatMedia($mediaModel),
            ]
        );
    }

}
