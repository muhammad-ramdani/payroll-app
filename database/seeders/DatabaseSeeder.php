<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'id' => Str::uuid(),
            'name' => 'Pemilik Toko',
            'username' => 'admin',
            'role' => 'admin',
        ]);
        
        $this->call(EmployeeSeeder::class);
        $this->call(AttendanceSeeder::class);
        $this->call(PayrollSeeder::class);
    }
}
