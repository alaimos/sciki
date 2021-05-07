<?php

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
        Route::post('/page/{page}/upload', [PageController::class, 'upload'])->name('page.upload');
        Route::resource('page', PageController::class)->only(['store', 'edit', 'update', 'destroy']);
    }
);
