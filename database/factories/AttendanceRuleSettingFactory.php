<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceRuleSettingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'shift_type' => 'Pagi',
            'punctual_end' => '07:15:00',
            'late_threshold' => '08:00:00',
            'attendance_bonus_penalty_id' => AttendanceBonusPenaltySetting::factory()
        ];
    }
}
