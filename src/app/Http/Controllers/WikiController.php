<?php

namespace App\Http\Controllers;

use App\Services\PageService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class WikiController extends Controller
{

    public function index(): Response
    {
        return Inertia::render('Wiki/Index');
    }

    public function show(Request $request, string $page): JsonResponse|Response|\Symfony\Component\HttpFoundation\Response
    {
        $pageService = new PageService($page);

        return $pageService->render($request);
    }
}
