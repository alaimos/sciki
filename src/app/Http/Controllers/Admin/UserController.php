<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class UserController extends Controller
{
    public function index(): InertiaResponse
    {
        return Inertia::render(
            'Admin/Users/Index',
            [
                'roles' => Role::select(['id', 'name'])->get()->map(
                    static function (Role $role) {
                        return [
                            'value' => $role->id,
                            'label' => $role->name,
                        ];
                    }
                ),
            ]
        );
    }

    public function indexTable(Request $request): JsonResponse
    {
        return response()->json((new UserService())->handleUsersTableRequest($request));
    }

    public function create(): InertiaResponse
    {
        return Inertia::render(
            'Admin/Users/Create',
            [
                'roles' => Role::select(['id', 'name'])->pluck('name', 'id'),
            ]
        );
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        User::create($data);

        return redirect()->route('admin.users.index');
    }

    public function edit(User $user): InertiaResponse
    {
        return Inertia::render(
            'Admin/Users/Edit',
            [
                'user'  => $user,
                'roles' => Role::select(['id', 'name'])->pluck('name', 'id'),
            ]
        );
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();
        if (isset($data['password'])) {
            $password = $data['password'];
            if (!empty($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }
        }
        $user->update($data);

        return redirect()->route('admin.users.index');
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->route('admin.users.index');
    }
}
