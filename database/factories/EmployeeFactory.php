<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class EmployeeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id'                       => User::factory(),
            'user_id'                  => User::factory(),
            'phone'                    => $this->faker->phoneNumber(),
            'address'                  => $this->faker->address(),
            'hire_date'                => $this->faker->dateTimeBetween('2016-01-01', 'now')->format('Y-m-d'),
            'bank_name'                => $this->faker->randomElement(['BNI', 'BRI', 'BCA', 'MANDIRI', 'BSI']),
            'account_number'           => $this->faker->bankAccountNumber(),
            'account_name'             => $this->faker->name(),
            'basic_salary'             => $this->faker->randomElement([4]) * 10000 + $this->faker->randomElement([0, 5000, 10000]),
            'paid_holidays'            => 2,
            'daily_overtime_pay'       => 10000,
            'transportation_allowance' => 100000,
            'bpjs_health'              => 1,
            'bpjs_employment'          => 3,
            'income_tax'               => 0,
        ];
    }
}