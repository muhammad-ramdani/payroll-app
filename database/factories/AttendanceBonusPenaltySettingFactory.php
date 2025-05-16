<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceBonusPenaltySettingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'bonus_amount' => 5000,
            'penalty_amount' => 3000
        ];
    }
}
