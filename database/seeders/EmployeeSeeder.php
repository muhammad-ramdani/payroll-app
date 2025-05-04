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
        for ($i = 0; $i < 8; $i++) {
            $uuid = Str::uuid();
            $name = fake()->name(); // Hasilkan nama
            
            // Buat user
            User::create([
                'id'       => $uuid,
                'name'     => $name,
                'username' => fake()->unique()->userName(),
                'password' => Hash::make('password'),
                'role'     => 'karyawan',
            ]);

            // Buat employee dengan account_name sesuai nama user
            Employee::factory()->create([
                'id'           => $uuid,
                'user_id'     => $uuid,
                'account_name' => $name, // Set account_name dari nama user
            ]);
        }
    }
}