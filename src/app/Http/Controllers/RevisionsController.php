<?php

namespace App\Http\Controllers;

use App\Services\PageService;
use Inertia\Response as InertiaResponse;

class RevisionsController extends Controller
{

    public function index(string $page): InertiaResponse
    {
        $pageService = new PageService($page);

        return $pageService->renderRevisions();
    }

    public function show(string $page, int $revision): InertiaResponse
    {
        $pageService = new PageService($page);

        return $pageService->renderRevision($revision);
    }


}
