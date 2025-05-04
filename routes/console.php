<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\Attendance;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    $date = now()->toDateString(); // YYYY-MM-DD
    $employees = Employee::all();

    foreach ($employees as $employee) {
        // Buat hanya jika belum ada
        Attendance::firstOrCreate(
            ['user_id' => $employee->user_id, 'date' => $date],
            [
                'clock_in'  => null,
                'clock_out' => null,
                'status'    => 'not_started', // atau status default Anda
            ]
        );
    }
})->dailyAt('00:02');
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

    Employee::whereNull('deleted_at')->each(function ($employee) use ($currentMonth, $currentYear) {
        // Cari payroll yang sudah dibuat di tanggal 10
        $payroll = Payroll::where('user_id', $employee->user_id)
            ->where('period_month', $currentMonth)
            ->where('period_year', $currentYear)
            ->first();

        if (!$payroll) {
            // Fallback jika payroll belum dibuat
            $payroll = Payroll::create([
                'user_id' => $employee->user_id,
                'period_month' => $currentMonth,
                'period_year' => $currentYear,
                'salary_status' => 'unpaid'
            ]);
        }

        // Ambil semua record dulu
        $attendances = Attendance::where('user_id', $employee->user_id)
            ->where('status', 'finished')
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->get();

        // Hitung hari hadir
        $totalAttendanceDays = $attendances->count();

        // Hitung hari lembur (>8.5 jam kerja)
        $totalOvertimeDays = $attendances->filter(function($att) {
            // Lewat jika clock_in atau clock_out kosong
            if (! $att->clock_in || ! $att->clock_out) {
                return false;
            }

            // Buat DateTime berdasarkan tanggal + jam
            $start = new \DateTime($att->date . ' ' . $att->clock_in);
            $end   = new \DateTime($att->date . ' ' . $att->clock_out);

            // Hitung selisih dalam detik, lalu konversi ke jam
            $diffSeconds = $end->getTimestamp() - $start->getTimestamp();
            $hoursWorked = $diffSeconds / 3600;

            // Kategori lembur: lebih dari 8.5 jam
            return $hoursWorked > 8.5;
        })->count();


        // Ambil data komponen gaji
        $basicSalary = $employee->basic_salary;
        $paidHolidays = $employee->paid_holidays;
        $dailyOvertimePay = $employee->daily_overtime_pay;

        // Hitung komponen penghasilan
        $totalBasicSalary = ($totalAttendanceDays + $paidHolidays) * $basicSalary;
        $totalOvertimePay = $totalOvertimeDays * $dailyOvertimePay;
        $grossSalary = $totalBasicSalary + $totalOvertimePay;

        // Hitung total potongan persen (BPJS + BPJKT + PPh)
        $totalDeductionPercent = $employee->bpjs_health + $employee->bpjs_employment + $employee->income_tax;

        // Hitung potongan
        $totalDeductions = round(($totalDeductionPercent / 100) * $grossSalary);

        // Hitung gaji bersih
        $netSalary = $grossSalary - $totalDeductions;

        // Update payroll dengan data yang dihitung
        $payroll->update([
            'total_attendance_days' => $totalAttendanceDays,
            'paid_holidays' => $paidHolidays,
            'total_overtime_days' => $totalOvertimeDays,
            'basic_salary' => $basicSalary,
            'daily_overtime_pay' => $dailyOvertimePay,
            'total_basic_salary' => $totalBasicSalary,
            'total_overtime_pay' => $totalOvertimePay,
            'gross_salary' => $grossSalary,
            'bpjs_health_percent' => $employee->bpjs_health,
            'bpjs_employment_percent' => $employee->bpjs_employment,
            'income_tax_percent' => $employee->income_tax,
            'total_deduction_percent' => $totalDeductionPercent,
            'total_deductions' => $totalDeductions,
            'net_salary' => $netSalary,
            'salary_status' => 'unpaid'
        ]);
    });
})->lastDayOfMonth('21:00');
// })->everyMinute();
