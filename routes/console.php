<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Employee;
use App\Models\EmployeeAttendance;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    $date = now()->toDateString(); // YYYY-MM-DD
    $employees = Employee::all();

    foreach ($employees as $employee) {
        // Buat hanya jika belum ada
        EmployeeAttendance::firstOrCreate(
            ['employee_id' => $employee->id, 'date' => $date],
            [
                'clock_in'  => null,
                'clock_out' => null,
                'status'    => 'not_started', // atau status default Anda
            ]
        );
    }
})->dailyAt('00:01');
// })->everyMinute();

Schedule::call(function () {
     $date = now()->toDateString(); // Mendapatkan tanggal hari ini dalam format YYYY-MM-DD

        // Memperbarui status menjadi 'leave' untuk entri yang belum memiliki clock_in dan clock_out
    EmployeeAttendance::whereDate('date', $date)
        ->whereNull('clock_in')
        ->whereNull('clock_out')
        ->update(['status' => 'leave']);
})->dailyAt('14:00');
// })->everyMinute();