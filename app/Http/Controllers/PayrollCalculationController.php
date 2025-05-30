<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\User;
use App\Models\Attendance;
use App\Models\AttendanceRuleSetting;
use App\Models\AttendanceBonusPenaltySetting;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PayrollCalculationController extends Controller
{
    public function index()
    {
        return Inertia::render('PayrollCalculationPage', ['payrolls' => Payroll::with('user')->orderBy(User::select('name')->whereColumn('users.id', 'payrolls.user_id'), 'asc')->get()]);
    }

    public function paid(Request $request, Payroll $payroll)
    {
        $payroll->update($request->validate([
            'salary_status' => 'in:paid_transfer,paid_cash',
            'confirmation_status' => 'in:pending_confirmation',
        ]));
    }

    public function calculate(Request $request, Payroll $payroll)
    {
        $employee = $payroll->user->employee;

        $attendances = Attendance::where('user_id', $payroll->user_id)->whereMonth('date', $payroll->period_month)->whereYear('date', $payroll->period_year)->get()->filter(fn($attendance) => $attendance->status === 'finished');

        $bonusPenaltySetting = AttendanceBonusPenaltySetting::first();
        $shiftRules = AttendanceRuleSetting::all()->keyBy('shift_type');

        $count = [
            'presentDays'      => 0,
            'overtimeDays'     => 0,
            'punctualDays'     => 0,
            'lateDays'         => 0,
        ];

        foreach ($attendances as $attendance) {
            $count['presentDays']++;

            if ($attendance->clock_in && $attendance->clock_out) {
                $duration = strtotime($attendance->clock_out) - strtotime($attendance->clock_in);
                if ($duration > (8.5 * 3600)) $count['overtimeDays']++;
            }

            if ($attendance->shift_type && $attendance->clock_in && ($rule = $shiftRules->get($attendance->shift_type))) {
                $clockInTime = strtotime($attendance->clock_in);
                if ($clockInTime <= strtotime($rule->punctual_end)) {
                    $count['punctualDays']++;
                } elseif ($clockInTime > strtotime($rule->late_threshold)) {
                    $count['lateDays']++;
                }
            }
        }

        $totalBasicSalary    = ($count['presentDays'] + $employee->paid_holidays) * $employee->basic_salary;
        $totalOvertimePay    = $count['overtimeDays'] * $employee->daily_overtime_pay;
        $totalBonus          = $count['punctualDays'] * $bonusPenaltySetting->bonus_amount;
        $totalPenalty        = $count['lateDays'] * $bonusPenaltySetting->penalty_amount;
        $grossSalary         = $totalBasicSalary + $totalOvertimePay + $employee->transportation_allowance + $totalBonus - $totalPenalty;

        $deductionPercent    = $employee->bpjs_health + $employee->bpjs_employment + $employee->income_tax;
        $totalDeductions     = round(($deductionPercent / 100) * $grossSalary);
        $netSalary           = $grossSalary - $totalDeductions;

        $payroll->update([
            'total_attendance_days'      => $count['presentDays'],
            'paid_holidays'              => $employee->paid_holidays,
            'total_overtime_days'        => $count['overtimeDays'],
            'total_punctual_days'        => $count['punctualDays'],
            'total_late_days'            => $count['lateDays'],
            'bonus_amount'               => $bonusPenaltySetting->bonus_amount,
            'penalty_amount'             => $bonusPenaltySetting->penalty_amount,
            'total_bonus'                => $totalBonus,
            'total_penalty'              => $totalPenalty,
            'basic_salary'               => $employee->basic_salary,
            'daily_overtime_pay'         => $employee->daily_overtime_pay,
            'transportation_allowance'   => $employee->transportation_allowance,
            'total_basic_salary'         => $totalBasicSalary,
            'total_overtime_pay'         => $totalOvertimePay,
            'gross_salary'               => $grossSalary,
            'bpjs_health_percent'        => $employee->bpjs_health,
            'bpjs_employment_percent'    => $employee->bpjs_employment,
            'income_tax_percent'         => $employee->income_tax,
            'total_deduction_percent'    => $deductionPercent,
            'total_deductions'           => $totalDeductions,
            'net_salary'                 => $netSalary,
            'salary_status'              => 'unpaid',
        ]);
    }
}
