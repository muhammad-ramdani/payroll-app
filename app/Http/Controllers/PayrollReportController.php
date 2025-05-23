<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use Inertia\Inertia;

class PayrollReportController extends Controller
{
    public function index()
    {
        return Inertia::render('PayrollReportPage', ['payrolls' => Payroll::get()]);
    }
}
