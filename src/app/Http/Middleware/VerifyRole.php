<?php

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;

class VerifyRole
{

    public function handle(Request $request, Closure $next, string $role): mixed
    {
        if (auth()->user()->role_id === (Role::ROLES[$role] ?? 0)) {
            abort(403, 'You should not be here!');
        }

        return $next($request);
    }
}
