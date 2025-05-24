<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\ShopProfileController;
use App\Http\Controllers\Settings\PersonalDataController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::middleware(['auth', RoleMiddleware::class . ':admin'])->group(function () {
        Route::get('settings/toko', [ShopProfileController::class, 'edit']);
        Route::patch('settings/toko', [ShopProfileController::class, 'update']);
    });

    Route::middleware(['auth', RoleMiddleware::class . ':karyawan'])->group(function () {
        Route::get('settings/data-diri', [PersonalDataController::class, 'edit']);
        Route::patch('settings/data-diri', [PersonalDataController::class, 'update']);
    });

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
