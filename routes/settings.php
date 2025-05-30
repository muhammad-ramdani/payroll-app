<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\ShopProfileController;
use App\Http\Controllers\Settings\PersonalDataController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile-akun');

    Route::get('settings/profile-akun', [ProfileController::class, 'edit'])->name('profile-akun.edit');
    Route::patch('settings/profile-akun', [ProfileController::class, 'update'])->name('profile-akun.update');

    Route::middleware(['auth', RoleMiddleware::class . ':admin'])->group(function () {
        Route::get('settings/profile-toko', [ShopProfileController::class, 'edit']);
        Route::patch('settings/profile-toko', [ShopProfileController::class, 'update'])->name('profile-toko.update');
    });

    Route::middleware(['auth', RoleMiddleware::class . ':karyawan'])->group(function () {
        Route::get('settings/data-diri', [PersonalDataController::class, 'edit']);
        Route::patch('settings/data-diri', [PersonalDataController::class, 'update'])->name('data-diri.update');
    });

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
