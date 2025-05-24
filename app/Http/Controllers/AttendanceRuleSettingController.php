<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\AttendanceRuleSetting;
use App\Models\AttendanceBonusPenaltySetting;

class AttendanceRuleSettingController extends Controller
{
    public function index()
    {
        return inertia('AttendanceRuleSettingPage', [
            'attendanceRuleSettings' => AttendanceRuleSetting::with('attendanceBonusPenaltySetting')->get()
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'attendanceRules.*.id' => 'required|exists:attendance_rule_settings,id',
            'attendanceRules.*.punctual_end' => 'required|date_format:H:i',
            'attendanceRules.*.late_threshold' => 'required|date_format:H:i',
            'bonus_penalty.id' => 'required|exists:attendance_bonus_penalty_settings,id',
            'bonus_penalty.bonus_amount' => 'required|integer|min:0',
            'bonus_penalty.penalty_amount' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['attendanceRules'] as $rule) {
                AttendanceRuleSetting::find($rule['id'])->update($rule);
            }
            
            AttendanceBonusPenaltySetting::find($validated['bonus_penalty']['id'])->update($validated['bonus_penalty']);
        });
    }
}