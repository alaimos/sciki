<?php


namespace App\Services;


use App\Models\Page;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use JetBrains\PhpStorm\ArrayShape;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class TablesService
{

    private function handleSorting(Request $request, Builder $query): Builder
    {
        $sortField = $request->get("sortField");
        if (!empty($sortField)) {
            $sortOrder = $request->get("sortOrder", "desc");
            $query = $query->orderBy($sortField, $sortOrder);
        }
        return $query;
    }

    #[ArrayShape([
        'data'        => "\App\Models\User[]|array",
        'sizePerPage' => "int",
        'page'        => "int",
        'totalSize'   => "int",
    ])] public function handlePagesTableRequest(
        Request $request
    ): array {
        $pagesQuery = Page::with('user');
        $userRole = auth()->user()->role_id;
        if ($userRole === Role::EDITOR) {
            $pagesQuery = $pagesQuery->where('user_id', auth()->id());
        } elseif ($userRole !== Role::ADMIN) {
            throw new UnauthorizedHttpException('The user is not allowed to view this table.');
        }
        $filters = $request->get("filters");
        if (!empty($filters) && is_array($filters)) {
            foreach ($filters as $field => $description) {
                $filterType = strtolower($description['filterType'] ?? '');
                $value = $description['filterVal'] ?? '';
                if (!empty($field) && $value !== '') {
                    if ($filterType === 'text') {
                        $pagesQuery = $pagesQuery->where($field, 'like', '%' . $value . '%');
                    } elseif ($filterType === 'select') {
                        $pagesQuery = $pagesQuery->where($field, $value);
                    }
                }
            }
        }
        $pagesQuery = $this->handleSorting($request, $pagesQuery);

        $paginatedResults = $pagesQuery->paginate(
            $request->get('sizePerPage', 10),
            page: $request->get('page', 1)
        );
        $data = $paginatedResults->map(
            static function (Page $user) {
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
        $usersQuery = $this->handleSorting($request, $usersQuery);

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
