<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\Attendance;
use App\Models\Shift;
use App\Models\AttendanceRuleSetting;
use App\Models\AttendanceBonusPenaltySetting;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {;
    $employees = Employee::all();

    foreach ($employees as $employee) {
        Attendance::firstOrCreate(
            ['user_id' => $employee->user_id, 'date' => now()->toDateString()],
            [
                'shift_type' => Shift::where('user_id', $employee->user_id)->value('shift_type'),
                'clock_in'   => null,
                'clock_out'  => null,
                'status'     => 'not_started',
            ]
        );
    }
})->dailyAt('06:30');
// })->everyMinute();

Schedule::call(function () {
    Attendance::whereDate('date', now()->toDateString())
        ->whereNull('clock_in')
        ->whereNull('clock_out')
        ->update(['status' => 'leave']);
})->dailyAt('14:00');
// })->everyMinute();

// Jadwal pembuatan payroll awal setiap tanggal 10
Schedule::call(function () {
    $currentMonth = now()->month;
    $currentYear = now()->year;

    Employee::whereNull('deleted_at')->each(function ($employee) use ($currentMonth, $currentYear) {
        Payroll::firstOrCreate(
            [
                'user_id' => $employee->user_id,
                'period_month' => $currentMonth,
                'period_year' => $currentYear
            ]
        );
    });
})->monthlyOn(10, '00:02');
// })->everyMinute();

// Jadwal update payroll akhir bulan
Schedule::call(function () {
    $currentMonth = now()->month;
    $currentYear  = now()->year;

    // [1] Ambil semua aturan shift dan bonus/penalty
    $bonusPenalty = AttendanceBonusPenaltySetting::first();
    $rules        = AttendanceRuleSetting::all()->keyBy('shift_type');

    // [2] Proses per karyawan
    Employee::with('user')
        ->whereNull('deleted_at')
        ->each(function ($employee) use ($currentMonth, $currentYear, $rules, $bonusPenalty) {
            // [3] Cari atau buat payroll untuk bulan ini
            $payroll = Payroll::firstOrCreate([
                'user_id'      => $employee->user_id,
                'period_month' => $currentMonth,
                'period_year'  => $currentYear,
            ]);

            // Jika net_salary sudah terisi, skip
            if ($payroll->exists && ! is_null($payroll->net_salary)) {
                return;
            }

            // [4] Ambil data presensi 'finished' bulan ini
            $attendances = Attendance::where('user_id', $employee->user_id)
                ->where('status', 'finished')
                ->whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->get();

            // [5] Inisialisasi counter
            $totalAttendanceDays = 0;
            $totalOvertimeHours  = 0;
            $totalPunctualDays   = 0;
            $totalLateDays       = 0;

            // [6] Proses setiap presensi
            foreach ($attendances as $att) {
                // 6a. Hitung hari kerja
                $totalAttendanceDays++;

                // 6b. Hitung jam lembur (jam kerja − 8 jika > 8)
                if ($att->clock_in && $att->clock_out) {
                    $startSeconds = strtotime($att->clock_in);
                    $endSeconds   = strtotime($att->clock_out);
                    $durationHours = ($endSeconds - $startSeconds) / 3600;

                    if ($durationHours > 8) {
                        // Tambahkan ke jam lembur total
                        $totalOvertimeHours += ($durationHours - 8);
                    }
                }

                // 6c. Hitung ketepatan waktu berdasarkan shift_type
                if ($att->shift_type && $att->clock_in) {
                    $rule = $rules->get($att->shift_type);
                    if ($rule) {
                        $clockIn      = strtotime($att->clock_in);
                        $punctualEnd  = strtotime($rule->punctual_end);
                        $lateThreshold = strtotime($rule->late_threshold);

                        if ($clockIn <= $punctualEnd) {
                            $totalPunctualDays++;
                        } elseif ($clockIn > $lateThreshold) {
                            $totalLateDays++;
                        }
                    }
                }
            }

            // Bulatkan ke integer terdekat
            $totalOvertimeHours = round($totalOvertimeHours);

            // [7] Hitung komponen gaji
            $basicSalary               = $employee->basic_salary;
            $hourlyOvertimePay         = $employee->hourly_overtime_pay;
            $transportationAllowance   = $employee->transportation_allowance;

            $totalBasicSalary = ($totalAttendanceDays + $employee->paid_holidays) * $basicSalary;
            $totalOvertimePay = $totalOvertimeHours * $hourlyOvertimePay;
            $totalBonus       = $totalPunctualDays * $bonusPenalty->bonus_amount;
            $totalPenalty     = $totalLateDays * $bonusPenalty->penalty_amount;

            $grossSalary = $totalBasicSalary
                         + $totalOvertimePay
                         + $transportationAllowance
                         + $totalBonus
                         - $totalPenalty;

            // [8] Hitung potongan berdasarkan persentase
            $deductionPercent = $employee->bpjs_health
                              + $employee->bpjs_employment
                              + $employee->income_tax;
            $totalDeductions = round(($deductionPercent / 100) * $grossSalary);

            // [9] Update payroll
            $payroll->update([
                // Data kehadiran & tunjangan
                'total_attendance_days'   => $totalAttendanceDays,
                'paid_holidays'           => $employee->paid_holidays,
                'total_overtime_hours'    => $totalOvertimeHours,

                // Ketepatan waktu & telat
                'total_punctual_days'     => $totalPunctualDays,
                'total_late_days'         => $totalLateDays,

                // Nilai tetap bonus/penalty
                'bonus_amount'            => $bonusPenalty->bonus_amount,
                'penalty_amount'          => $bonusPenalty->penalty_amount,

                // Komponen nominal
                'total_bonus'             => $totalBonus,
                'total_penalty'           => $totalPenalty,
                'basic_salary'            => $basicSalary,
                'hourly_overtime_pay'     => $hourlyOvertimePay,
                'transportation_allowance'=> $transportationAllowance,
                'total_basic_salary'      => $totalBasicSalary,
                'total_overtime_pay'      => $totalOvertimePay,

                // Total
                'gross_salary'            => $grossSalary,
                'bpjs_health_percent'     => $employee->bpjs_health,
                'bpjs_employment_percent' => $employee->bpjs_employment,
                'income_tax_percent'      => $employee->income_tax,
                'total_deduction_percent' => $deductionPercent,
                'total_deductions'        => $totalDeductions,
                'net_salary'              => $grossSalary - $totalDeductions,

                // Status payroll (misalnya 'unpaid' atau sesuai kebutuhan)
                'salary_status'           => 'unpaid',
            ]);
        });
})->lastDayOfMonth('21:00');
// })->everyMinute();
