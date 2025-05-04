<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Attendance;
use App\Models\User;

class AttendanceReportController extends Controller
{
    // AttendanceReportController.php
    public function admin()
    {
        $attendances = Attendance::with('user')->orderBy(User::select('name')->whereColumn('users.id', 'attendances.user_id'), 'asc')->get();

        return Inertia::render('AttendanceReportForAdminPage', [
            'attendances' => $attendances,
        ]);
    }

    public function employee()
    {
        $attendances = Attendance::with('user')->where('user_id', auth()->id())->get();

        return Inertia::render('AttendanceReportForEmployeePage', [
            'attendances' => $attendances,
        ]);
    }
}
