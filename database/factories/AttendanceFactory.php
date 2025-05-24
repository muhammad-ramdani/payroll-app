<?php

namespace Database\Factories;

use App\Models\Shift;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'shift_type' => 'Pagi',
            'date' => now()->toDateString(),
            'status' => 'not_started',
        ];
    }
}
