<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::get('absensi', [AttendanceController::class, 'index'])->name('absensi');
    Route::patch('absensi/{attendance}', [AttendanceController::class, 'update'])->name('absensi.update');

    Route::get('laporan-absensi', function () {
        return Inertia::render('AttendanceReportPage');
    })->name('laporan-absensi');

    Route::middleware(['auth', RoleMiddleware::class . ':admin'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('DashboardPage');
        })->name('dashboard');

        // ini route untuk data karyawan
        Route::get('data-karyawan', [EmployeeController::class, 'index'])->name('data-karyawan.index');
        Route::post('data-karyawan', [EmployeeController::class, 'store'])->name('data-karyawan.store');
        Route::patch('data-karyawan/{employee}', [EmployeeController::class, 'update'])->name('data-karyawan.update');
        Route::get('data-karyawan/{employee}', [EmployeeController::class, 'show'])->name('data-karyawan.show');
        Route::delete('data-karyawan/{employee}', [EmployeeController::class, 'destroy'])->name('data-karyawan.destroy');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
