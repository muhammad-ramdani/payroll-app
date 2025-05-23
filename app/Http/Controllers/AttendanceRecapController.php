<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Inertia\Inertia;

class AttendanceRecapController extends Controller
{
    public function index()
    {
        return Inertia::render('AttendanceRecapPage', ['attendances' => Attendance::with('user')->where('user_id', auth()->id())->orderBy('date', 'desc')->get()]);
    }
}
