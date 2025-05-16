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
            'clock_in'  => 'nullable|date_format:H:i:s',
            'clock_out' => 'nullable|date_format:H:i:s',
            'status'    => 'required|in:not_started,working,finished,leave,sick',
        ]);

        // Ambil nilai existing
        $clockIn = $attendance->clock_in;
        $clockOut = $attendance->clock_out;

        // Handle clock_in hanya jika ada dalam request
        if ($request->has('clock_in')) {
            // Validasi jika mencoba mengubah clock_in yang sudah ada ke null
            if ($attendance->clock_in && $validated['clock_in'] === null) {
                throw ValidationException::withMessages([
                    'clock_in' => 'Clock in cannot be cleared once set'
                ]);
            }
            $clockIn = $validated['clock_in'];
        }

        // Handle clock_out hanya jika ada dalam request
        if ($request->has('clock_out')) {
            $clockOut = $validated['clock_out'];
        }

        // Validasi clock_out harus setelah clock_in
        if ($clockOut && !$clockIn) {
            throw ValidationException::withMessages([
                'clock_out' => 'Clock in must be filled first'
            ]);
        }

        $attendance->update([
            'clock_in' => $clockIn,
            'clock_out' => $clockOut,
            'status' => $validated['status']
        ]);
    }
}
