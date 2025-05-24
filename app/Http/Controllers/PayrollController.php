<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function index()
    {
        return Inertia::render('PayrollPage', ['payrolls' => Payroll::with('user')->where('user_id', auth()->id())->orderBy('period_month', 'desc')->get()]);
    }

    public function confirmation(Request $request, Payroll $payroll)
    {
        if ($payroll->confirmation_status === 'blank') return back();
        $payroll->update($request->validate(['confirmation_status' => 'in:received']));
    }
}
