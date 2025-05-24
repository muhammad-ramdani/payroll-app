<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

class PayrollFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'             => Employee::factory(),
            'period_month'        => now()->month,
            'period_year'         => now()->year,
            'salary_status'       => 'uncalculated',
            'confirmation_status' => 'blank',
        ];
    }
}
