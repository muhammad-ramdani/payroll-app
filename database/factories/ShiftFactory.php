<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShiftFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => Employee::inRandomOrder()->first()->user_id,
            'shift_type' => fake()->randomElement(['Pagi', 'Siang'])
        ];
    }
}
