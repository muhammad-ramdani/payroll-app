<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\User;
use App\Models\ShopProfile;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class PayrollSlipPDFController extends Controller
{
    public function index($id)
    {
        $payroll = Payroll::with('user.employee')->findOrFail($id);

        $user = auth()->user();
        if ($user->role !== 'admin' && $payroll->user_id !== $user->id) {
            abort(403);
        }

        $shopProfile = ShopProfile::first();

        $admin = User::where('role', 'admin')->first();

        $pdf = PDF::loadView('pdf.payroll', compact('payroll', 'shopProfile', 'admin'))->setPaper('a4', 'portrait');

        $monthName = Carbon::create()->month($payroll->period_month)->translatedFormat('F');

        $filename = "Slip Gaji-{$payroll->user->name}-{$monthName} {$payroll->period_year}.pdf";

        return $pdf->stream($filename);
    }
}
