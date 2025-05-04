<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => Employee::factory(),
            'date' => now()->toDateString(),
            'clock_in' => null,
            'clock_out' => null,
            'status' => 'not_started',
        ];
    }
}
