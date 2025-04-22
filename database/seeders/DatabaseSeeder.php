<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(EmployeeSeeder::class);

        User::factory()->create([
            'name' => 'Ramdani',
            'username' => 'admin',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Karyawan',
            'username' => 'karyawan',
            'role' => 'karyawan',
        ]);
    }
}
