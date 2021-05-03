<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

class WikiController extends Controller
{

    public function index(): Response
    {
        return Inertia::render('Wiki/Index');
    }

    public function show(string $page): Response
    {
        //@todo: get page by slug
        //@todo: if page does not exist show the 404 page
        //@todo: otherwise parse the page and return the Inertia page component
        return Inertia::render('Wiki/Index');
    }
}
