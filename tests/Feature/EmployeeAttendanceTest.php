<?php

use App\Models\User;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use Illuminate\Support\Facades\Hash;

// Test Autentikasi
test('tamu tidak bisa mengakses halaman absensi', function () {
    $this->get('/absensi')->assertRedirect('/');
});

test('pengguna terautentikasi bisa mengakses halaman absensi', function () {
    $user = User::factory()->create(['password' => Hash::make('password')]);
    
    $this->actingAs($user)
         ->get('/absensi')
         ->assertOk();
});

// Test Update Absensi
test('berhasil update clock in dan status working', function () {
    $employee = Employee::factory()->create();
    $attendance = EmployeeAttendance::factory()->create([
        'employee_id' => $employee->id,
        'clock_in' => null,
        'status' => 'not_started'
    ]);

    $this->actingAs(User::factory()->create()) // User biasa
         ->patch(route('rekap-absensi.update', $attendance), [
            'clock_in' => now()->format('H:i:s'),
            'status' => 'working'
         ])
         ->assertOk();

    $this->assertDatabaseHas('employee_attendances', [
        'id' => $attendance->id,
        'status' => 'working',
        'clock_in' => now()->format('H:i:s')
    ]);
});

test('berhasil update clock out dan status finished', function () {
    $employee = Employee::factory()->create();
    $attendance = EmployeeAttendance::factory()->create([
        'employee_id' => $employee->id,
        'clock_in' => '08:00:00',
        'status' => 'working'
    ]);

    $this->actingAs(User::factory()->create())
         ->patch(route('rekap-absensi.update', $attendance), [
            'clock_out' => now()->format('H:i:s'),
            'status' => 'finished'
         ])
         ->assertOk();

    $this->assertDatabaseHas('employee_attendances', [
        'id' => $attendance->id,
        'status' => 'finished'
    ]);
});

// Test Validasi
test('gagal update clock out tanpa clock in', function () {
    $employee = Employee::factory()->create();
    $attendance = EmployeeAttendance::factory()->create([
        'employee_id' => $employee->id,
        'clock_in' => null,
        'clock_out' => null,
        'status' => 'not_started'
    ]);

    $response = $this->actingAs(User::factory()->create())
         ->patch(route('rekap-absensi.update', $attendance), [
            'clock_out' => '17:00:00',
            'status' => 'finished'
         ]);

    $response->assertInvalid(['clock_out']); // <-- Ganti ini
});

test('validasi format waktu untuk clock_in dan clock_out', function () {
    $employee = Employee::factory()->create();
    $attendance = EmployeeAttendance::factory()->create([
        'employee_id' => $employee->id
    ]);

    $response = $this->actingAs(User::factory()->create())
         ->patch(route('rekap-absensi.update', $attendance), [
            'clock_in' => 'invalid-time',
            'clock_out' => 'invalid-time',
            'status' => 'working'
         ]);

    $response->assertInvalid(['clock_in', 'clock_out']);
});

test('validasi pilihan status', function () {
    $employee = Employee::factory()->create();
    $attendance = EmployeeAttendance::factory()->create([
        'employee_id' => $employee->id
    ]);

    $response = $this->actingAs(User::factory()->create())
         ->patch(route('rekap-absensi.update', $attendance), [
            'status' => 'invalid-status'
         ]);

    $response->assertInvalid(['status']);
});