<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Attendance;
use App\Models\User;

class AttendanceReportController extends Controller
{
    public function admin()
    {
        return Inertia::render('AttendanceReportForAdminPage', ['attendances' => Attendance::with('user')->orderBy(User::select('name')->whereColumn('users.id', 'attendances.user_id'), 'asc')->get()]);
    }

    public function employee()
    {
        return Inertia::render('AttendanceReportForEmployeePage', ['attendances' => Attendance::with('user')->where('user_id', auth()->id())->get()]);
    }
}
