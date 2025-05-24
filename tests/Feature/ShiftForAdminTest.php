<?php

use App\Models\User;
use App\Models\Employee;
use App\Models\Shift;

test('user yang belum login tidak dapat mengakses halaman shift di admin', function () {
    $this->get('/admin-shift-karyawan')->assertRedirect('/');
});

test('user yang terautentikasi role admin dapat mengakses halaman shift di admin', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/admin-shift-karyawan')->assertOk();
});

test('user yang terautentikasi role karyawan tidak dapat mengakses halaman shift di admin', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/admin-shift-karyawan')->assertRedirect('/absensi');
});

test('admin dapat mengganti shift karyawan', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $employee = Employee::factory()->create();
    $shift = Shift::factory()->create(['user_id' => $employee->user_id, 'shift_type' => 'Pagi']);

    $this->patch('/admin-shift-karyawan/' . $employee->user_id, [
        'shift_type' => 'Siang',
    ])->assertOk();

    $this->assertDatabaseHas('shifts', [
        'user_id' => $employee->user_id,
        'shift_type' => 'Siang',
    ]);
});