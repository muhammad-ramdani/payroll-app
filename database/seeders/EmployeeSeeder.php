<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $names = ['Meli', 'Wina', 'Hikmah', 'Satriadi', 'Anjar', 'Ilham', 'Asep'];

        foreach ($names as $name) {
            $uuid = Str::uuid();

            User::create([
                'id'       => $uuid,
                'name'     => $name,
                'username' => $name . '_' . mt_rand(100, 999),
                'password' => Hash::make('password'),
                'role'     => 'karyawan',
            ]);

            Employee::factory()->create([
                'id'           => $uuid,
                'user_id'      => $uuid,
                'account_name' => $name,
            ]);
        }
    }
}