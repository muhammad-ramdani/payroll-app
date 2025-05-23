<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\User;
use App\Models\ShopProfile;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class PayrollController extends Controller
{
    public function index()
    {
        return Inertia::render('PayrollPage', ['payrolls' => Payroll::with('user')->where('user_id', auth()->id())->orderBy('period_month', 'desc')->get()]);
    }

    public function generatePDF($id)
    {
        $payroll = Payroll::with('user.employee')->findOrFail($id);

        $shopProfile = ShopProfile::first();

        $admin = User::where('role', 'admin')->first();

        $pdf = PDF::loadView('pdf.payroll', compact('payroll', 'shopProfile', 'admin'))->setPaper('a4', 'portrait');

        $monthName = Carbon::create()->month($payroll->period_month)->translatedFormat('F');

        $filename = "Slip Gaji-{$payroll->user->name}-{$monthName} {$payroll->period_year}.pdf";

        return $pdf->stream($filename);
    }

    public function confirmation(Request $request, Payroll $payroll)
    {
        if ($payroll->confirmation_status === 'blank') return back();
        $payroll->update($request->validate(['confirmation_status' => 'in:received']));
    }
}
