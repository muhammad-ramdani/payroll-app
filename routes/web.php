<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\PayrollCalculationController;
use App\Http\Controllers\ShiftForAdminController;
use App\Http\Controllers\AttendanceRuleSettingController;
use App\Http\Controllers\ShiftSwapController;
use App\Http\Controllers\ShiftForEmployeeController;
use App\Http\Controllers\PayrollSlipPDFController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\User;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::middleware(['auth', RoleMiddleware::class . ':karyawan'])->group(function () {
        Route::get('presensi', [AttendanceController::class, 'index'])->name('presensi');
        Route::patch('presensi/{attendance}', [AttendanceController::class, 'update'])->name('presensi.update');
        
        Route::get('penggajian', [PayrollController::class, 'index']);
        Route::patch('penggajian/confirmation/{payroll}', [PayrollController::class, 'confirmation']);
        
        Route::get('shift-karyawan', [ShiftForEmployeeController::class, 'index']);
        Route::post('swap-requests', [ShiftForEmployeeController::class, 'requestSwap']);
        
        Route::get('permintaan-tukar-shift', [ShiftSwapController::class, 'index'])->name('permintaan-tukar-shift');
        Route::post('permintaan-tukar-shift/{id}/approve', [ShiftSwapController::class, 'approveSwap'])->name('permintaan-tukar-shift.approve');
        Route::post('permintaan-tukar-shift/{id}/reject', [ShiftSwapController::class, 'rejectSwap'])->name('permintaan-tukar-shift.reject');

        Route::get('rekap-presensi', function () {
            return Inertia::render('AttendanceRecapPage', ['attendances' => Attendance::with('user')->where('user_id', auth()->id())->orderBy('date', 'desc')->get()]);
        });

        Route::get('laporan-presensi-karyawan', function () {
            return Inertia::render('AttendanceReportForEmployeePage', ['attendances' => Attendance::with('user')->where('user_id', auth()->id())->get()]);
        });
    });

    Route::middleware(['auth', RoleMiddleware::class . ':admin'])->group(function () {
        Route::get('dashboard', function () {
            $today = now()->toDateString();
            
            return Inertia::render('DashboardPage', [
                'attendanceStats' => [
                    'working' => Attendance::where('date', $today)->whereNotNull('clock_in')->count(),
                    'leave' => Attendance::where('date', $today)->where('status', 'leave')->count(),
                    'sick' => Attendance::where('date', $today)->where('status', 'sick')->count(),
                    'totalEmployees' => Employee::count()
                ]
            ]);
        })->name('dashboard');

        Route::get('monitoring-presensi', function () {
            return Inertia::render('AttendanceMonitoringPage', [
                'monitoring_attendances' => Attendance::with('user')->orderBy('shift_type', 'asc')->orderBy(User::select('name')->whereColumn('users.id', 'attendances.user_id'), 'asc')->get()
            ]);
        });

        Route::get('laporan-presensi-admin', function () {
            return Inertia::render('AttendanceReportForAdminPage', [
                'attendances' => Attendance::with('user')->orderBy(User::select('name')->whereColumn('users.id', 'attendances.user_id'), 'asc')->get()
            ]);
        });

        Route::get('laporan-penggajian', function () {
            return Inertia::render('PayrollReportPage', ['payrolls' => Payroll::get()]);
        });

        Route::get('admin-shift-karyawan', [ShiftForAdminController::class, 'index']);
        Route::patch('admin-shift-karyawan/{user}', [ShiftForAdminController::class, 'update']);

        Route::get('aturan-presensi', [AttendanceRuleSettingController::class, 'index']);
        Route::patch('aturan-presensi', [AttendanceRuleSettingController::class, 'update'])->name('aturan-presensi.update');

        Route::get('perhitungan-penggajian', [PayrollCalculationController::class, 'index']);
        Route::patch('perhitungan-penggajian/paid/{payroll}', [PayrollCalculationController::class, 'paid']);
        Route::patch('perhitungan-penggajian/calculate/{payroll}', [PayrollCalculationController::class, 'calculate']);

        Route::get('data-karyawan', [EmployeeController::class, 'index']);
        Route::post('data-karyawan', [EmployeeController::class, 'store']);
        Route::patch('data-karyawan/{employee}', [EmployeeController::class, 'update']);
        Route::delete('data-karyawan/{employee}', [EmployeeController::class, 'destroy']);
    });

    Route::get('penggajian/pdf/{id}', [PayrollSlipPDFController::class, 'index']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
