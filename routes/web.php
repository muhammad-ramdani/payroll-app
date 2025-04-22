<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::get('absensi', function () {
        return Inertia::render('absensi');
    })->name('absensi');

    Route::get('laporan-absensi', function () {
        return Inertia::render('laporan-absensi');
    })->name('laporan-absensi');

    Route::middleware(['auth', RoleMiddleware::class . ':admin'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');

        // ini route untuk data karyawan
        Route::get('data-karyawan', [EmployeeController::class, 'index'])->name('data-karyawan');
        Route::delete('employees/{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
