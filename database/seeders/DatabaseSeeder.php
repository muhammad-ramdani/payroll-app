<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'id' => Str::uuid(),
            'name' => 'Muhammad Ramdani',
            'username' => 'admin',
            'role' => 'admin',
        ]);
        
        $this->call(EmployeeSeeder::class);
        $this->call(ShopProfileSeeder::class);
        $this->call(AttendanceRuleSettingSeeder::class);
        $this->call(ShiftSeeder::class);
        $this->call(AttendanceSeeder::class);
        $this->call(PayrollSeeder::class);
    }
}
