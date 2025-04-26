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

        // Handle null values
        $clockIn = $validated['clock_in'] ?? null;
        $clockOut = $validated['clock_out'] ?? null;

        // Validasi custom
        if ($clockOut && !$attendance->clock_in && !$clockIn) {
            throw ValidationException::withMessages([
                'clock_out' => 'Clock in harus diisi terlebih dahulu'
            ]);
        }

        $attendance->update([
            'clock_in' => $clockIn,
            'clock_out' => $clockOut,
            'status' => $validated['status']
        ]);
    }
}
