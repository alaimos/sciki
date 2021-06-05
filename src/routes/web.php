<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Editor\MediaController;
use App\Http\Controllers\Editor\PageController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\WikiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
/// Wiki Routes
Route::get('/', [WikiController::class, 'index'])->name('wiki.index');
Route::get('/wiki/{page}', [WikiController::class, 'show'])->name('wiki.show');
Route::post('/search', [WikiController::class, 'search'])->name('wiki.search');
Route::get('/search', fn() => redirect()->route('wiki.index'));
Route::post('/typeahead', [WikiController::class, 'typeahead'])->name('wiki.typeahead');
/// Auth Routes
Auth::routes();
/// Tags Routes
Route::post('/tags/typeahead', [TagController::class, 'typeahead'])->name('tag.typeahead');
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
        Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');
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
                Route::get('/media/{media}', [MediaController::class, 'show'])->name('page.media.show');
                Route::get('/media/{media}/image', [MediaController::class, 'image'])->name('page.media.image');
                Route::post('/page/{page}/media/upload', [MediaController::class, 'upload'])->name('page.media.upload');
                Route::put('/page/{page}/media/{media}', [MediaController::class, 'update'])->name('page.media.update');
                /// Page Routes
                Route::put('/page/{page}/publish', [PageController::class, 'publish'])->name('page.publish');
                Route::put('/page/{page}/draft', [PageController::class, 'draft'])->name('page.draft');
                Route::resource('page', PageController::class)->only(['store', 'edit', 'update', 'destroy']);
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

