<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Payroll;
use Illuminate\Database\Seeder;

class PayrollSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employees = Employee::all();

        foreach ($employees as $employee) {
            Payroll::factory()->create([
                'employee_id' => $employee->id,
                'period_month' => now()->month,
                'period_year' => now()->year,
                'status'  => 'uncalculated',
            ]);
        }
    }
}
