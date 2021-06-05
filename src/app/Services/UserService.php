<?php


namespace App\Services;


use App\Models\User;
use Illuminate\Http\Request;
use JetBrains\PhpStorm\ArrayShape;

class UserService
{

    #[ArrayShape([
        'data'        => "\App\Models\User[]|array",
        'sizePerPage' => "int",
        'page'        => "int",
        'totalSize'   => "int",
    ])] public function handleUsersTableRequest(
        Request $request
    ): array {
        $usersQuery = User::with('role');
        $filters = $request->get("filters");
        if (!empty($filters) && is_array($filters)) {
            foreach ($filters as $field => $description) {
                $filterType = strtolower($description['filterType'] ?? '');
                $value = $description['filterVal'] ?? '';
                if (!empty($field) && $value !== '') {
                    if ($filterType === 'text') {
                        $usersQuery = $usersQuery->where($field, 'like', '%' . $value . '%');
                    } elseif ($filterType === 'select') {
                        if ($field === 'role.id') {
                            $usersQuery = $usersQuery->whereHas('role', fn($q) => $q->where('id', $value));
                        } else {
                            $usersQuery = $usersQuery->where($field, $value);
                        }
                    }
                }
            }
        }
        $sortField = $request->get("sortField");
        if (!empty($sortField)) {
            $sortOrder = $request->get("sortOrder", "desc");
            $usersQuery = $usersQuery->orderBy($sortField, $sortOrder);
        }

        $paginatedResults = $usersQuery->paginate(
            $request->get('sizePerPage', 10),
            page: $request->get('page', 1)
        );
        $data = $paginatedResults->map(
            static function (User $user) {
                return $user->append(
                    [
                        'readable_created_at',
                    ]
                );
            }
        )->all();

        return [
            'data'        => $data,
            'sizePerPage' => $paginatedResults->perPage(),
            'page'        => $paginatedResults->currentPage(),
            'totalSize'   => $paginatedResults->total(),
        ];
    }


}
