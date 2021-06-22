<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\CommentsController;
use App\Http\Controllers\Editor\MediaController;
use App\Http\Controllers\Editor\PageController;
use App\Http\Controllers\RevisionsController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\WikiController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

$proxy_url = config('sciki.proxy_url');
$proxy_schema = config('sciki.proxy_scheme');

if (!empty($proxy_url)) {
    URL::forceRootUrl($proxy_url);
}

if (!empty($proxy_schema)) {
    URL::forceScheme($proxy_schema);
}

Route::get('/', [WikiController::class, 'index'])->name('wiki.index');
Route::get('/contacts', fn() => Inertia::render('Static/Contacts'))->name('static.contacts');

/// Auth Routes
Auth::routes();

Route::post('/comments/{comment}/vote', [CommentsController::class, 'vote'])->name('comments.vote');
Route::delete('/comments/{comment}', [CommentsController::class, 'destroy'])->name('comments.destroy');
Route::get('/media/{media}', [MediaController::class, 'show'])->name('page.media.show');
Route::post('/search', [WikiController::class, 'search'])->name('wiki.search');
Route::get('/search', fn() => redirect()->route('wiki.index'));
Route::post('/typeahead', [WikiController::class, 'typeahead'])->name('wiki.typeahead');
/// Tags Routes
Route::post('/tags/typeahead', [TagController::class, 'typeahead'])->name('tag.typeahead');
Route::get('/tags/{tag}', [TagController::class, 'show'])->name('tag.show');
/// Wiki Routes
Route::get('/wiki/{page}/revisions/{revision}', [RevisionsController::class, 'show'])->name('wiki.revisions.show');
Route::get('/wiki/{page}/revisions', [RevisionsController::class, 'index'])->name('wiki.revisions.index');
Route::get('/wiki/{page}/comments', [WikiController::class, 'showComments'])->name('wiki.comments');
Route::post('/wiki/{page}/comments', [WikiController::class, 'storeComment'])->name('wiki.comments.store');
Route::get('/wiki/{page}', [WikiController::class, 'show'])->name('wiki.show');
/// Plugins public routes
foreach (config('sciki.resource_providers') as $resourceProviderClass) {
    app($resourceProviderClass)->publicRoutes();
}


/// Auth Users routes
Route::group(
    [
        'middleware' => [
            'auth',
            'role:user',
        ],
    ],
    static function () {
        Route::get('/home', [ProfileController::class, 'index'])->name('home');
        Route::patch('/user/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::patch('/user/password', [ProfileController::class, 'passwordUpdate'])->name('profile.password.update');
        /// Plugins user routes
        foreach (config('sciki.resource_providers') as $resourceProviderClass) {
            app($resourceProviderClass)->userRoutes();
        }
        Route::group(
            [
                'middleware' => 'role:editor',
            ],
            static function () {
                /// Media Routes
                Route::get('/media/{media}/image', [MediaController::class, 'image'])->name('page.media.image');
                Route::post('/page/{page}/media/upload', [MediaController::class, 'upload'])->name('page.media.upload');
                Route::put('/page/{page}/media/{media}', [MediaController::class, 'update'])->name('page.media.update');
                /// Page Routes
                Route::put('/page/{page}/publish', [PageController::class, 'publish'])->name('page.publish');
                Route::put('/page/{page}/draft', [PageController::class, 'draft'])->name('page.draft');
                Route::post('/page/{page}/vote', [PageController::class, 'vote'])->name('page.vote');
                Route::post('/page-table', [PageController::class, 'indexTable'])->name('page.index.table');
                Route::resource('page', PageController::class)->except(['show', 'create']);
                /// Plugins editor routes
                foreach (config('sciki.resource_providers') as $resourceProviderClass) {
                    app($resourceProviderClass)->editorRoutes();
                }
            }
        );
        Route::group(
            [
                'middleware' => 'role:admin',
                'prefix'     => 'admin',
                'as'         => 'admin.'
            ],
            static function () {
                Route::post('users/table', [UserController::class, 'indexTable'])->name('users.table');
                Route::resource('users', UserController::class)->except("show");
                /// Plugins admin routes
                foreach (config('sciki.resource_providers') as $resourceProviderClass) {
                    app($resourceProviderClass)->adminRoutes();
                }
            }
        );
    }
);

