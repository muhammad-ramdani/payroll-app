<?php

use App\Models\User;
use App\Models\Payroll;
use App\Models\Employee;
use App\Models\AttendanceBonusPenaltySetting;
use App\Models\AttendanceRuleSetting;
use App\Models\Attendance;

test('user yang belum login tidak dapat mengakses halaman perhitungan penggajian', function () {
    $this->get('/perhitungan-penggajian')->assertRedirect('/');
});

test('user yang terautentikasi role admin dapat mengakses halaman perhitungan penggajian', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/perhitungan-penggajian')->assertOk();
});

test('user yang terautentikasi role karyawan tidak dapat mengakses halaman perhitungan penggajian', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/perhitungan-penggajian')->assertRedirect('/presensi');
});

test('admin dapat menghitung penggajian karyawan', function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']));

    $user = User::factory()->create(['role' => 'karyawan']);
    $employee = Employee::factory()->create(['user_id' => $user->id]);
    $attendanceBonusPenaltySetting = AttendanceBonusPenaltySetting::factory()->create();
    AttendanceRuleSetting::factory()->create(['attendance_bonus_penalty_id' => $attendanceBonusPenaltySetting->id]);
    Attendance::factory()->create([
        'user_id' => $employee->user_id,
        'clock_in' => '07:00',
        'clock_out' => '17:00',
        'status' => 'finished',
    ]);
    Attendance::factory()->create([
        'user_id' => $employee->user_id,
        'clock_in' => '09:00',
        'clock_out' => '17:00',
        'status' => 'finished',
    ]);
    $payroll = Payroll::factory()->create(['user_id' => $employee->user_id]);

    $this->patch("/perhitungan-penggajian/calculate/{$payroll->id}")->assertOk();
});

test('admin dapat menandai penggajian sebagai sudah dibayar', function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']));

    $user = User::factory()->create(['role' => 'karyawan']);
    $employee = Employee::factory()->create(['user_id' => $user->id]);
    $payroll = Payroll::factory()->create(['user_id' => $employee->user_id]);

    $this->patch("/perhitungan-penggajian/paid/{$payroll->id}", [
        'salary_status' => 'paid_transfer',
        'confirmation_status' => 'pending_confirmation',
    ])->assertOk();

    $payroll->refresh();
    expect($payroll->salary_status)->toBe('paid_transfer');
    expect($payroll->confirmation_status)->toBe('pending_confirmation');
});