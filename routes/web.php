<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\MonitoringAttendanceController;
use App\Http\Controllers\AttendanceReportController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::middleware(['auth', RoleMiddleware::class . ':karyawan'])->group(function () {
        Route::get('absensi', [AttendanceController::class, 'index'])->name('absensi');
        Route::patch('absensi/{attendance}', [AttendanceController::class, 'update'])->name('absensi.update');

        Route::get('laporan-absensi-karyawan', [AttendanceReportController::class, 'employee'])->name('laporan-absensi.employee');

        Route::get('penggajian', [PayrollController::class, 'employee'])->name('penggajian');
        Route::patch('penggajian/confirmation/{payroll}', [PayrollController::class, 'confirmation'])->name('penggajian.confirmation');
    });

    Route::middleware(['auth', RoleMiddleware::class . ':admin'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('DashboardPage');
        })->name('dashboard');

        Route::get('monitoring-absensi', [MonitoringAttendanceController::class, 'index'])->name('monitoring-absensi.index');

        Route::get('laporan-absensi-admin', [AttendanceReportController::class, 'admin'])->name('laporan-absensi.admin');

        Route::get('laporan-penggajian', [PayrollController::class, 'report'])->name('laporan-penggajian');

        // ini route untuk perhitungan penggajian
        Route::get('perhitungan-penggajian', [PayrollController::class, 'index'])->name('perhitungan-penggajian');
        Route::patch('perhitungan-penggajian/paid/{payroll}', [PayrollController::class, 'paid'])->name('perhitungan-penggajian.paid');
        Route::patch('perhitungan-penggajian/calculate/{payroll}', [PayrollController::class, 'calculate'])->name('perhitungan-penggajian.calculate');

        // ini route untuk data karyawan
        Route::get('data-karyawan', [EmployeeController::class, 'index'])->name('data-karyawan.index');
        Route::post('data-karyawan', [EmployeeController::class, 'store'])->name('data-karyawan.store');
        Route::patch('data-karyawan/{employee}', [EmployeeController::class, 'update'])->name('data-karyawan.update');
        Route::delete('data-karyawan/{employee}', [EmployeeController::class, 'destroy'])->name('data-karyawan.destroy');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
