<?php

use App\Models\User;
use App\Models\Employee;

test('user yang belum login tidak dapat mengakses halaman data diri pada settings', function () {
    $this->get('/settings/data-diri')->assertRedirect('/');
});

test('user yang terautentikasi role karyawan dapat mengakses halaman data diri pada settings', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/settings/data-diri')->assertOk();
});

test('user yang terautentikasi role admin tidak dapat mengakses halaman data diri pada settings', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/settings/data-diri')->assertRedirect('/dashboard');
});

test('karyawan yang dapat mengupdate data diri', function () {
    $user = User::factory()->create(['role' => 'karyawan']);
    $employee = Employee::factory()->create(['user_id' => $user->id]);

    // akses halaman edit
    $this->actingAs($user)->get('/settings/data-diri')->assertOk();

    // update data
    $payload = [
        'phone' => '0812345678',
        'address' => 'Jl. Contoh No. 1',
        'bank_name' => 'BCA',
        'account_number' => '1234567890',
        'account_name' => 'Nama Karyawan',
    ];
    $this->patch('/settings/data-diri', $payload)->assertRedirect();
});