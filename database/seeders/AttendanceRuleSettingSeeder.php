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
            'bonus_amount' => 2000,
            'penalty_amount' => 2000
        ]);

        AttendanceRuleSetting::create([
            'shift_type' => 'Pagi',
            'punctual_end' => '07:10',
            'late_threshold' => '08:00',
            'attendance_bonus_penalty_id' => $bonusPenalty->id
        ]);

        AttendanceRuleSetting::create([
            'shift_type' => 'Siang',
            'punctual_end' => '12:10',
            'late_threshold' => '13:00',
            'attendance_bonus_penalty_id' => $bonusPenalty->id
        ]);
    }
}