<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\PayrollCalculationController;
use App\Http\Controllers\PayrollReportController;
use App\Http\Controllers\AttendanceMonitoringController;
use App\Http\Controllers\AttendanceReportController;
use App\Http\Controllers\ShiftForAdminController;
use App\Http\Controllers\AttendanceRuleSettingController;
use App\Http\Controllers\ShiftSwapController;
use App\Http\Controllers\AttendanceRecapController;
use App\Http\Controllers\ShiftForEmployeeController;
use App\Http\Controllers\PayrollSlipPDFController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::middleware(['auth', RoleMiddleware::class . ':karyawan'])->group(function () {
        Route::get('absensi', [AttendanceController::class, 'index'])->name('absensi');
        Route::patch('absensi/{attendance}', [AttendanceController::class, 'update'])->name('absensi.update');
        
        Route::get('penggajian', [PayrollController::class, 'index']);
        Route::patch('penggajian/confirmation/{payroll}', [PayrollController::class, 'confirmation']);
        
        Route::get('shift-karyawan', [ShiftForEmployeeController::class, 'index']);
        Route::post('swap-requests', [ShiftForEmployeeController::class, 'requestSwap']);
        
        Route::get('permintaan-tukar-shift', [ShiftSwapController::class, 'index'])->name('permintaan-tukar-shift');
        Route::post('permintaan-tukar-shift/{id}/approve', [ShiftSwapController::class, 'approveSwap'])->name('permintaan-tukar-shift.approve');
        Route::post('permintaan-tukar-shift/{id}/reject', [ShiftSwapController::class, 'rejectSwap'])->name('permintaan-tukar-shift.reject');

        Route::get('rekap-absensi', [AttendanceRecapController::class, 'index']);

        Route::get('laporan-absensi-karyawan', [AttendanceReportController::class, 'employee']);
    });

    Route::middleware(['auth', RoleMiddleware::class . ':admin'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('DashboardPage');
        })->name('dashboard');

        Route::get('monitoring-absensi', [AttendanceMonitoringController::class, 'index'])->name('monitoring-absensi.index');

        Route::get('laporan-absensi-admin', [AttendanceReportController::class, 'admin']);

        Route::get('laporan-penggajian', [PayrollReportController::class, 'index']);

        Route::get('admin-shift-karyawan', [ShiftForAdminController::class, 'index'])->name('admin-shift-karyawan.admin');
        Route::patch('admin-shift-karyawan/{user}', [ShiftForAdminController::class, 'update'])->name('admin-shift-karyawan.update');

        Route::get('aturan-absensi', [AttendanceRuleSettingController::class, 'index'])->name('aturan-absensi');
        Route::patch('aturan-absensi', [AttendanceRuleSettingController::class, 'update'])->name('aturan-absensi.update');

        Route::get('perhitungan-penggajian', [PayrollCalculationController::class, 'index']);
        Route::patch('perhitungan-penggajian/paid/{payroll}', [PayrollCalculationController::class, 'paid']);
        Route::patch('perhitungan-penggajian/calculate/{payroll}', [PayrollCalculationController::class, 'calculate']);

        Route::get('data-karyawan', [EmployeeController::class, 'index'])->name('data-karyawan.index');
        Route::post('data-karyawan', [EmployeeController::class, 'store'])->name('data-karyawan.store');
        Route::patch('data-karyawan/{employee}', [EmployeeController::class, 'update'])->name('data-karyawan.update');
        Route::delete('data-karyawan/{employee}', [EmployeeController::class, 'destroy'])->name('data-karyawan.destroy');
    });

    Route::get('penggajian/pdf/{id}', [PayrollSlipPDFController::class, 'index']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
