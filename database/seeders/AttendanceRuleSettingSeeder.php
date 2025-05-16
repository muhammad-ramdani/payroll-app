<?php

namespace Database\Seeders;

use App\Models\AttendanceBonusPenaltySetting;
use App\Models\AttendanceRuleSetting;
use Illuminate\Database\Seeder;

class AttendanceRuleSettingSeeder extends Seeder
{
    public function run(): void
    {
        $bonusPenalty = AttendanceBonusPenaltySetting::create([
            'bonus_amount' => 5000,
            'penalty_amount' => 5000
        ]);

        AttendanceRuleSetting::create([
            'shift_type' => 'Pagi',
            'punctual_end' => '07:15',
            'late_threshold' => '08:00',
            'attendance_bonus_penalty_id' => $bonusPenalty->id
        ]);

        AttendanceRuleSetting::create([
            'shift_type' => 'Siang',
            'punctual_end' => '12:15',
            'late_threshold' => '13:00',
            'attendance_bonus_penalty_id' => $bonusPenalty->id
        ]);
    }
}
