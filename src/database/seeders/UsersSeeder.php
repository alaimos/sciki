<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $password = \Hash::make('password');
        User::firstOrCreate(
            [
                'email' => 'user@user',
            ],
            [
                'name'              => 'user',
                'password'          => $password,
                'email_verified_at' => now(),
                'role_id'           => 1,
            ]
        );
        User::firstOrCreate(
            [
                'email' => 'editor@editor',
            ],
            [
                'name'              => 'editor',
                'password'          => $password,
                'email_verified_at' => now(),
                'role_id'           => 2,
            ]
        );
        User::firstOrCreate(
            [
                'email' => 'editor1@editor',
            ],
            [
                'name'              => 'editor1',
                'password'          => $password,
                'email_verified_at' => now(),
                'role_id'           => 2,
            ]
        );
        User::firstOrCreate(
            [
                'email' => 'admin@admin',
            ],
            [
                'name'              => 'admin',
                'password'          => $password,
                'email_verified_at' => now(),
                'role_id'           => 3,
            ]
        );
    }
}
