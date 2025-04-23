<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::get('absensi', function () {
        return Inertia::render('EmployeeAttendancePage');
    })->name('absensi');

    Route::get('laporan-absensi', function () {
        return Inertia::render('AttendanceReportPage');
    })->name('laporan-absensi');

    Route::middleware(['auth', RoleMiddleware::class . ':admin'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('DashboardPage');
        })->name('dashboard');

        // ini route untuk data karyawan
        Route::get('data-karyawan', [EmployeeController::class, 'index']);
        Route::post('data-karyawan', [EmployeeController::class, 'store']);
        Route::put('data-karyawan/{employee}', [EmployeeController::class, 'update']);
        Route::delete('data-karyawan/{employee}', [EmployeeController::class, 'destroy']);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
