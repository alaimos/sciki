<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        Role::create(
            [
                'id'   => 1,
                'name' => 'User',
            ]
        );
        Role::create(
            [
                'id'   => 2,
                'name' => 'Editor',
            ]
        );
        Role::create(
            [
                'id'   => 3,
                'name' => 'Admin',
            ]
        );
    }
}
