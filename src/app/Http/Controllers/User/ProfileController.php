<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ProfileController extends Controller
{

    public function index(): InertiaResponse
    {
        return Inertia::render(
            'User/Profile/Index'
        );
    }


}
