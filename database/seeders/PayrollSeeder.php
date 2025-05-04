<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\Attendance;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use DateTime;

class PayrollSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employees = Employee::with('user')->get();

        foreach ($employees as $employee) {
            // Membuat 12 payroll untuk 12 bulan terakhir
            for ($i = 1; $i < 13; $i++) {
                $date = Carbon::now()->subMonths($i);
                $isLastMonth = $i === 1;

                // Data dasar payroll
                $payrollData = [
                    'user_id' => $employee->user_id,
                    'period_month' => $date->month,
                    'period_year' => $date->year,
                    'salary_status' => $isLastMonth ? 'uncalculated' : 'paid_cash',
                    'confirmation_status' => $isLastMonth ? 'blank' : 'received',
                ];

                if (!$isLastMonth) {
                    // Hitung data presensi
                    $attendances = Attendance::where('user_id', $employee->user_id)
                        ->where('status', 'finished')
                        ->whereMonth('date', $date->month)
                        ->whereYear('date', $date->year)
                        ->get();

                    // Hitung hari kerja dan lembur
                    $totalAttendanceDays = $attendances->count();

                    $totalOvertimeDays = $attendances->filter(function ($attendance) {
                        if (!$attendance->clock_in || !$attendance->clock_out) {
                            return false;
                        }

                        $start = new DateTime($attendance->date . ' ' . $attendance->clock_in);
                        $end = new DateTime($attendance->date . ' ' . $attendance->clock_out);
                        
                        return ($end->getTimestamp() - $start->getTimestamp()) / 3600 > 8.5;
                    })->count();

                    // Hitung komponen gaji
                    $payrollData = array_merge($payrollData, [
                        'total_attendance_days' => $totalAttendanceDays,
                        'paid_holidays' => $employee->paid_holidays,
                        'total_overtime_days' => $totalOvertimeDays,
                        'basic_salary' => $employee->basic_salary,
                        'daily_overtime_pay' => $employee->daily_overtime_pay,
                        'total_basic_salary' => ($totalAttendanceDays + $employee->paid_holidays) * $employee->basic_salary,
                        'total_overtime_pay' => $totalOvertimeDays * $employee->daily_overtime_pay,
                        'gross_salary' => ($totalAttendanceDays + $employee->paid_holidays) * $employee->basic_salary + ($totalOvertimeDays * $employee->daily_overtime_pay),
                        'bpjs_health_percent' => $employee->bpjs_health,
                        'bpjs_employment_percent' => $employee->bpjs_employment,
                        'income_tax_percent' => $employee->income_tax,
                        'total_deduction_percent' => $employee->bpjs_health + $employee->bpjs_employment + $employee->income_tax,
                        'total_deductions' => round((($employee->bpjs_health + $employee->bpjs_employment + $employee->income_tax) / 100) * (($totalAttendanceDays + $employee->paid_holidays) * $employee->basic_salary + ($totalOvertimeDays * $employee->daily_overtime_pay))),
                        'net_salary' => (($totalAttendanceDays + $employee->paid_holidays) * $employee->basic_salary + ($totalOvertimeDays * $employee->daily_overtime_pay)) - round((($employee->bpjs_health + $employee->bpjs_employment + $employee->income_tax) / 100 * (($totalAttendanceDays + $employee->paid_holidays) * $employee->basic_salary + ($totalOvertimeDays * $employee->daily_overtime_pay))))
                    ]);
                }

                Payroll::create($payrollData);
            }
        }
    }
}