<?php

use App\Models\User;

test('user yang belum login tidak dapat mengakses halaman monitoring absensi', function () {
    $this->get('/monitoring-absensi')->assertRedirect('/');
});

test('user yang terautentikasi role admin dapat mengakses halaman monitoring absensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/monitoring-absensi')->assertOk();
});

test('user yang terautentikasi role karyawan tidak dapat mengakses halaman monitoring absensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/monitoring-absensi')->assertRedirect('/absensi');
});
