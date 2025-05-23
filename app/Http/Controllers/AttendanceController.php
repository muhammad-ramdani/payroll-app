<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceRuleSetting;
use App\Models\AttendanceBonusPenaltySetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index()
    {
        return Inertia::render('AttendancePage', [
            'attendances' => Attendance::with('user')->where('user_id', auth()->id())->whereDate('date', now())->get(),
            'attendanceRules' => AttendanceRuleSetting::whereIn('id', [1, 2])->get()->keyBy('id'),
            'bonusPenaltySettings' => AttendanceBonusPenaltySetting::find(1),
        ]);
    }

    public function update(Request $request, Attendance $attendance)
    {
        $action = $request->validate([
            'action' => 'in:clock_in,clock_out,leave,sick',
        ])['action'];
        
        if ($attendance->status === 'leave' || $attendance->status === 'sick') return back();

        if ($action === 'clock_in' && !$attendance->clock_in) {
            $attendance->update(['clock_in' => now()->format('H:i:s'), 'status' => 'working']);
        } elseif ($action === 'clock_out' && $attendance->clock_in && !$attendance->clock_out) {
            $attendance->update(['clock_out' => now()->format('H:i:s'), 'status' => 'finished']);
        } elseif (($action === 'leave' || $action === 'sick') && $attendance->status === 'not_started') {
            $attendance->update(['status' => $action]);
        }
    }
}
