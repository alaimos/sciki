<?php

use App\Http\Controllers\Editor\MediaController;
use App\Http\Controllers\Editor\PageController;
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

Route::get('/', [WikiController::class, 'index'])->name('wiki.index');

Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

Route::get('/wiki/{page}', [WikiController::class, 'show'])->name('wiki.show');

Route::group(
    [
        'middleware' => 'auth',
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
    }
);
