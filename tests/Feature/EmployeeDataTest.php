<?php

use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Str;

test('user yang belum login tidak dapat mengakses halaman Data Karyawan', function () {
    $this->get('/data-karyawan')->assertRedirect('/');
});

test('user yang terautentikasi dengan role admin dapat mengakses halaman data-karyawan', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $this->get('/data-karyawan')->assertOk();
});

test('user yang terautentikasi dengan role karyawan tidak dapat mengakses halaman data-karyawan', function () {
    $karyawan = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($karyawan);

    $this->get('/data-karyawan')->assertRedirect('/presensi');
});

//! Test untuk fitur Create Data Karyawan

test('admin dapat menambahkan data karyawan baru', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $uuid = (string) Str::uuid();
    $payload = [
        'id'             => $uuid,
        'user' => [
            'name'     => 'John Doe',
            'username' => 'johndoe',
        ],
        'phone'          => '08123456789',
        'address'        => 'Jl. Contoh No. 1',
        'hire_date'      => '2023-10-01',
        'bank_name'      => 'ABC',
        'account_number' => '1234567890',
        'account_name'   => 'John Doe',
        'basic_salary'   => '50000',
        'paid_holidays'  => '2',
        'daily_overtime_pay' => '10000',
        'bpjs_health'    => '1',
        'bpjs_employment'=> '3',
        'income_tax'     => '0',
        'shift_type'     => 'Pagi',
    ];

    $this->post('/data-karyawan', $payload)->assertOk();
});

//! Test untuk fitur Edit Data Karyawan

test('admin dapat mengubah data karyawan', function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']));
    $user = User::factory()->create(['role' => 'karyawan']);

    $employee = Employee::factory()->create();

    $payload = [
        'user' => [
            'name' => 'Updated Name',
        ],
        'phone' => '08123456789',
        'address' => 'Jl. Contoh No. 1',
        'hire_date' => '2023-10-01',
        'bank_name' => 'ABC',
        'account_number' => '1234567890',
        'account_name' => 'John Doe',
        'basic_salary' => '50000',
        'paid_holidays' => '2',
        'daily_overtime_pay' => '10000',
        'bpjs_health' => '1',
        'bpjs_employment' => '3',
        'income_tax' => '0',
    ];

    $this->patch("/data-karyawan/{$employee->id}", $payload)->assertOk();
});

//! Test untuk fitur Delete Data Karyawan

test('admin dapat menghapus data karyawan', function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']));

    $employee = Employee::factory()->create();

    $this->delete("/data-karyawan/{$employee->id}")->assertOk();
});