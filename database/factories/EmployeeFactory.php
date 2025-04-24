<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $name = $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'hire_date' => $this->faker->dateTimeBetween('2016-01-01', 'now')->format('Y-m-d'),
            'bank_name' => $this->faker->randomElement(['BNI', 'BRI', 'BCA', 'Mandiri', 'BSI']),
            'account_number' => $this->faker->bankAccountNumber(),
            'account_name' => $name,
            'basic_salary' => $this->faker->randomElement([4, 5, 6, 7]) * 10000 + $this->faker->randomElement([0, 5000, 10000]),
            'paid_holidays' => 2,
            'daily_overtime_pay' => $this->faker->randomElement([1, 2]) * 10000 + $this->faker->randomElement([0, 5000, 10000]),
            'bpjs_health' => 1,
            'bpjs_employment' => 3,
            'income_tax' => 0,
        ];
    }
}
