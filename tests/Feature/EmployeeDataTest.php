<?php

use App\Models\User;

test('tamu diarahkan ke halaman login', function () {
    $this->get('/data-karyawan')->assertRedirect('/');
});

test('user yang terautentikasi dengan role admin dapat mengakses halaman data-karyawan', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $this->actingAs($admin);

    $this->get('/data-karyawan')->assertOk();
});

test('user yang terautentikasi dengan role karyawan tidak dapat mengakses halaman data-karyawan', function () {
    $karyawan = User::factory()->create([
        'role' => 'karyawan',
    ]);

    $this->actingAs($karyawan);

    // Pastikan pengguna dengan role karyawan diarahkan ke dashboard
    $this->get('/data-karyawan')->assertRedirect('/absensi');
});
