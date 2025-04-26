<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeAttendance;
use Illuminate\Database\Seeder;

class EmployeeAttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();

        foreach ($employees as $employee) {
            EmployeeAttendance::create([
                'employee_id' => $employee->id,
                'date' => now()->toDateString(),
                'clock_in' => null,
                'clock_out' => null,
                'status' => 'not_started'
            ]);
        }
    }
}