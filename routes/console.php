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

Schedule::call(function () {
    $date = now()->toDateString(); // YYYY-MM-DD
    $employees = Employee::with('user.shift')->get();

    foreach ($employees as $employee) {
        $shiftType = $employee->user->shift->shift_type ?? 'Pagi';

        // Buat hanya jika belum ada
        Attendance::firstOrCreate(
            ['user_id' => $employee->user_id, 'date' => $date],
            [
                'shift_type' => $shiftType,
                'clock_in'  => null,
                'clock_out' => null,
                'status'    => 'not_started',
            ]
        );
    }
})->dailyAt('06:30');
// })->everyMinute();

Schedule::call(function () {
     $date = now()->toDateString(); // Mendapatkan tanggal hari ini dalam format YYYY-MM-DD

        // Memperbarui status menjadi 'leave' untuk entri yang belum memiliki clock_in dan clock_out
    Attendance::whereDate('date', $date)
        ->whereNull('clock_in')
        ->whereNull('clock_out')
        ->update(['status' => 'leave']);
})->dailyAt('13:30');
// })->everyMinute();

// Jadwal pembuatan payroll awal setiap tanggal 10
Schedule::call(function () {
    $currentMonth = now()->month;
    $currentYear = now()->year;

    Employee::whereNull('deleted_at')->each(function ($employee) use ($currentMonth, $currentYear) {
        // Membuat payroll dengan data minimal jika belum ada
        Payroll::firstOrCreate(
            [
                'user_id' => $employee->user_id,
                'period_month' => $currentMonth,
                'period_year' => $currentYear
            ],
            [
                'salary_status' => 'uncalculated',
                'confirmation_status' => 'blank',
            ]
        );
    });
})->monthlyOn(10, '00:02');
// })->everyMinute();

// Jadwal update payroll akhir bulan
Schedule::call(function () {
    $currentMonth = now()->month;
    $currentYear = now()->year;

    // [1] Ambil semua aturan shift dan bonus/penalty
    $bonusPenalty = AttendanceBonusPenaltySetting::first();
    $rules = AttendanceRuleSetting::all()->keyBy('shift_type');

    // [2] Proses per karyawan
    Employee::with('user')->whereNull('deleted_at')->each(function ($employee) use ($currentMonth, $currentYear, $rules, $bonusPenalty) {
        // [3] Cari payroll yang belum terhitung (net_salary null) atau buat payroll
        $payroll = Payroll::firstOrCreate([
            'user_id' => $employee->user_id,
            'period_month' => $currentMonth,
            'period_year' => $currentYear
        ]);

        // Jika net_salary sudah ada nilai, skip proses
        if ($payroll->exists && !is_null($payroll->net_salary)) {
            return;
        }

        // [4] Ambil data presensi yang relevan
        $attendances = App\Models\Attendance::where('user_id', $employee->user_id)
            ->where('status', 'finished')
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->get();

        // [5] Inisialisasi counter
        $counters = [
            'total_attendance' => 0,
            'total_overtime' => 0,
            'total_punctual' => 0,
            'total_late' => 0,
        ];

        // [6] Proses setiap presensi
        foreach ($attendances as $att) {
            // 6a. Hitung hari kerja
            $counters['total_attendance']++;

            // 6b. Hitung lembur menggunakan timestamp PHP native
            if ($att->clock_in && $att->clock_out) {
                $start = strtotime($att->clock_in);
                $end = strtotime($att->clock_out);
                if (($end - $start) > (8.5 * 3600)) { // 8.5 jam dalam detik
                    $counters['total_overtime']++;
                }
            }

            // 6c. Hitung ketepatan waktu berdasarkan shift_type di attendance
            if ($att->shift_type && $att->clock_in) {
                $rule = $rules->get($att->shift_type);
                
                if ($rule) {
                    $clockIn = strtotime($att->clock_in);
                    $punctualEnd = strtotime($rule->punctual_end);
                    $lateThreshold = strtotime($rule->late_threshold);

                    if ($clockIn <= $punctualEnd) {
                        $counters['total_punctual']++;
                    } elseif ($clockIn > $lateThreshold) {
                        $counters['total_late']++;
                    }
                }
            }
        }

        // [7] Hitung komponen gaji
        $grossSalary = (
            (($counters['total_attendance'] + $employee->paid_holidays) * $employee->basic_salary) + // Gaji pokok
            ($counters['total_overtime'] * $employee->daily_overtime_pay) +                         // Lembur
            ($counters['total_punctual'] * $bonusPenalty->bonus_amount) -                          // Bonus
            ($counters['total_late'] * $bonusPenalty->penalty_amount)                              // Potongan
        );

        // [8] Hitung potongan
        $totalDeductionPercent = $employee->bpjs_health + $employee->bpjs_employment + $employee->income_tax;
        $totalDeductions = round(($totalDeductionPercent / 100) * $grossSalary);

        // [9] Update payroll
        $payroll->update([
            // Data dasar
            'total_attendance_days' => $counters['total_attendance'],
            'paid_holidays' => $employee->paid_holidays,
            'total_overtime_days' => $counters['total_overtime'],
            
            // Komponen waktu
            'total_punctual_days' => $counters['total_punctual'],
            'total_late_days' => $counters['total_late'],
            
            // Nilai tetap
            'bonus_amount' => $bonusPenalty->bonus_amount,
            'penalty_amount' => $bonusPenalty->penalty_amount,
            
            // Perhitungan
            'total_bonus' => $counters['total_punctual'] * $bonusPenalty->bonus_amount,
            'total_penalty' => $counters['total_late'] * $bonusPenalty->penalty_amount,
            
            // Komponen gaji
            'basic_salary' => $employee->basic_salary,
            'daily_overtime_pay' => $employee->daily_overtime_pay,
            'total_basic_salary' => ($counters['total_attendance'] + $employee->paid_holidays) * $employee->basic_salary,
            'total_overtime_pay' => $counters['total_overtime'] * $employee->daily_overtime_pay,
            
            // Total
            'gross_salary' => $grossSalary,
            'bpjs_health_percent' => $employee->bpjs_health,
            'bpjs_employment_percent' => $employee->bpjs_employment,
            'income_tax_percent' => $employee->income_tax,
            'total_deduction_percent' => $totalDeductionPercent,
            'total_deductions' => $totalDeductions,
            'net_salary' => $grossSalary - $totalDeductions,
            
            // Status
            'salary_status' => 'unpaid'
        ]);
    });
})->lastDayOfMonth('21:00');
// })->everyMinute();
