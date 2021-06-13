<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\ChangePasswordRequest;
use App\Http\Requests\User\ProfileUpdateRequest;
use App\Models\Comment;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ProfileController extends Controller
{

    public function index(): InertiaResponse
    {
        $published = Page::where('user_id', auth()->id())->where('draft', 0)->count();
        $drafts = Page::where('user_id', auth()->id())->where('draft', 1)->count();
        $comments = Comment::where('user_id', auth()->id())->count();
        return Inertia::render(
            'User/Profile/Index',
            [
                'published' => $published,
                'drafts'    => $drafts,
                'comments'  => $comments,
            ]
        );
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        auth()->user()->update($request->validated());
        return redirect()->route('home')->with('success', 'Profile updated!');
    }

    public function passwordUpdate(ChangePasswordRequest $request): RedirectResponse
    {
        $data = $request->validated();
        auth()->user()->update(
            [
                'password' => Hash::make($data['password']),
            ]
        );
        return redirect()->route('home')->with('success', 'Password changed!');
    }

}
