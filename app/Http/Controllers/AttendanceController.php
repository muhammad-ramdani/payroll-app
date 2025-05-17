<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceRuleSetting;
use App\Models\AttendanceBonusPenaltySetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    public function index()
    {
        $attendances = Attendance::with('user')->where('user_id', auth()->id())->whereDate('date', now())->get();

        $attendanceRules = AttendanceRuleSetting::whereIn('id', [1, 2])->get()->keyBy('id');

        $bonusPenaltySettings = AttendanceBonusPenaltySetting::find(1);

        return Inertia::render('AttendancePage', [
            'attendances' => $attendances,
            'attendanceRules' => $attendanceRules,
            'bonusPenaltySettings' => $bonusPenaltySettings,
        ]);
    }

    public function recap()
    {
        $attendances = Attendance::with('user')->where('user_id', auth()->id())->orderBy('date', 'desc')->get();

        return Inertia::render('AttendanceRecapPage', [
            'attendances' => $attendances,
        ]);
    }

    public function update(Request $request, Attendance $attendance)
    {
        $validated = $request->validate([
            'action' => 'required|in:clock_in,clock_out,leave,sick',
        ]);

        if ($attendance->status === 'leave' || $attendance->status === 'sick') return back();

        $action = $validated['action'];

        if ($action === 'clock_in' && !$attendance->clock_in) {
            $attendance->update(['clock_in' => now()->format('H:i:s'), 'status' => 'working']);
        } elseif ($action === 'clock_out' && $attendance->clock_in && !$attendance->clock_out) {
            $attendance->update(['clock_out' => now()->format('H:i:s'), 'status' => 'finished']);
        } elseif (($action === 'leave' || $action === 'sick') && $attendance->status === 'not_started') {
            $attendance->update(['status' => $action]);
        }
    }
}
