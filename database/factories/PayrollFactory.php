<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

class PayrollFactory extends Factory
{
    public function definition(): array
    {
        return [
            'period_month'            => now()->month,
            'period_year'             => now()->year,
            // 'paid_holidays'           => '2',
            // 'bonus_amount'            => '5000',
            // 'penalty_amount'          => '4000',
            // 'basic_salary'            => '40000',
            // 'daily_overtime_pay'      => '10000',
            // 'bpjs_health_percent'     => '1',
            // 'bpjs_employment_percent' => '2',
            // 'income_tax_percent'      => '0',
            'salary_status'           => 'uncalculated',
            'confirmation_status'     => 'blank',
        ];
    }
}
