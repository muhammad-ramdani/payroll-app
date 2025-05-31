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

        // Ambil semua presensi 'finished' di bulan dan tahun payroll
        $attendances = Attendance::where('user_id', $payroll->user_id)
            ->whereMonth('date', $payroll->period_month)
            ->whereYear('date', $payroll->period_year)
            ->get()
            ->filter(fn($attendance) => $attendance->status === 'finished');

        $bonusPenaltySetting = AttendanceBonusPenaltySetting::first();
        $shiftRules = AttendanceRuleSetting::all()->keyBy('shift_type');

        // Inisialisasi counter
        $count = [
            'presentDays'   => 0,
            'overtimeHours' => 0, // menggantikan 'overtimeDays'
            'punctualDays'  => 0,
            'lateDays'      => 0,
        ];

        foreach ($attendances as $attendance) {
            // Hitung hari kerja
            $count['presentDays']++;

            // HITUNG LEMBUR BERDASARKAN JAM (> 8 jam)
            if ($attendance->clock_in && $attendance->clock_out) {
                $start    = strtotime($attendance->clock_in);
                $end      = strtotime($attendance->clock_out);
                $duration = ($end - $start) / 3600; // durasi dalam jam desimal

                if ($duration > 8) {
                    $count['overtimeHours'] += ($duration - 8);
                }
            }

            // HITUNG KETEPATAN WAKTU BERDASARKAN SHIFT
            if ($attendance->shift_type && $attendance->clock_in && ($rule = $shiftRules->get($attendance->shift_type))) {
                $clockInTime   = strtotime($attendance->clock_in);
                $punctualEnd   = strtotime($rule->punctual_end);
                $lateThreshold = strtotime($rule->late_threshold);

                if ($clockInTime <= $punctualEnd) {
                    $count['punctualDays']++;
                } elseif ($clockInTime > $lateThreshold) {
                    $count['lateDays']++;
                }
            }
        }

        // Bulatkan total overtimeHours ke integer terdekat
        $count['overtimeHours'] = round($count['overtimeHours']);

        // Hitung komponen gaji
        $totalBasicSalary  = ($count['presentDays'] + $employee->paid_holidays) * $employee->basic_salary;
        $totalOvertimePay  = $count['overtimeHours'] * $employee->hourly_overtime_pay;
        $totalBonus        = $count['punctualDays'] * $bonusPenaltySetting->bonus_amount;
        $totalPenalty      = $count['lateDays'] * $bonusPenaltySetting->penalty_amount;
        $grossSalary       = $totalBasicSalary
                        + $totalOvertimePay
                        + $employee->transportation_allowance
                        + $totalBonus
                        - $totalPenalty;

        $deductionPercent  = $employee->bpjs_health + $employee->bpjs_employment + $employee->income_tax;
        $totalDeductions   = round(($deductionPercent / 100) * $grossSalary);
        $netSalary         = $grossSalary - $totalDeductions;

        // Update payroll dengan field yang sudah disesuaikan
        $payroll->update([
            'total_attendance_days'   => $count['presentDays'],
            'paid_holidays'           => $employee->paid_holidays,
            'total_overtime_hours'    => $count['overtimeHours'],    // jam lembur dibulatkan
            'total_punctual_days'     => $count['punctualDays'],
            'total_late_days'         => $count['lateDays'],
            'bonus_amount'            => $bonusPenaltySetting->bonus_amount,
            'penalty_amount'          => $bonusPenaltySetting->penalty_amount,
            'total_bonus'             => $totalBonus,
            'total_penalty'           => $totalPenalty,
            'basic_salary'            => $employee->basic_salary,
            'hourly_overtime_pay'     => $employee->hourly_overtime_pay,
            'transportation_allowance' => $employee->transportation_allowance,
            'total_basic_salary'      => $totalBasicSalary,
            'total_overtime_pay'      => $totalOvertimePay,
            'gross_salary'            => $grossSalary,
            'bpjs_health_percent'     => $employee->bpjs_health,
            'bpjs_employment_percent' => $employee->bpjs_employment,
            'income_tax_percent'      => $employee->income_tax,
            'total_deduction_percent' => $deductionPercent,
            'total_deductions'        => $totalDeductions,
            'net_salary'              => $netSalary,
            'salary_status'           => 'unpaid',
        ]);
    }
}
