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
        User::create(
            [
                'name'              => 'user',
                'email'             => 'user@user',
                'password'          => $password,
                'email_verified_at' => now(),
                'role_id'           => 1,
            ]
        );
        User::create(
            [
                'name'              => 'editor',
                'email'             => 'editor@editor',
                'password'          => $password,
                'email_verified_at' => now(),
                'role_id'           => 2,
            ]
        );
        User::create(
            [
                'name'              => 'admin',
                'email'             => 'admin@admin',
                'password'          => $password,
                'email_verified_at' => now(),
                'role_id'           => 3,
            ]
        );
    }
}
