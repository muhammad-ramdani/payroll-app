<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Shift;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::has('user')->get();
        
        // Bagi menjadi 2 grup dengan cara manual
        $total = $employees->count();
        $half = (int) ceil($total / 2);
        
        // Ambil grup pertama untuk shift pagi
        $groupPagi = $employees->take($half);
        // Sisanya untuk shift siang
        $groupSiang = $employees->skip($half);

        // Seed shift pagi
        $groupPagi->each(function ($employee) {
            Shift::firstOrCreate(
                ['user_id' => $employee->user_id],
                ['shift_type' => 'Pagi']
            );
        });

        // Seed shift siang
        $groupSiang->each(function ($employee) {
            Shift::firstOrCreate(
                ['user_id' => $employee->user_id],
                ['shift_type' => 'Siang']
            );
        });
    }
}