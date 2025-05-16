<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonitoringAttendanceController extends Controller
{
    public function index()
    {
        $monitoring_attendances = Attendance::with('user')->orderBy('shift_type', 'asc')->orderBy(User::select('name')->whereColumn('users.id', 'attendances.user_id'), 'asc')->get();

        return Inertia::render('AttendanceMonitoringPage', [
            'monitoring_attendances' => $monitoring_attendances,
        ]); 
    }
}
