<?php

namespace App\Http\Controllers;

use App\Models\EmployeeAttendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    public function index()
    {
        $employee_attendances = EmployeeAttendance::with('employee')->get();

        return Inertia::render('EmployeeAttendancePage', [
            'employee_attendances' => $employee_attendances,
        ]);
    }

    public function update(Request $request, EmployeeAttendance $attendance)
    {
        $validated = $request->validate([
            'clock_in'  => 'nullable|date_format:H:i:s',
            'clock_out' => 'nullable|date_format:H:i:s',
            'status'    => 'required|in:not_started,working,finished,leave',
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
