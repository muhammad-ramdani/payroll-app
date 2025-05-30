<?php

use App\Models\User;

test('tamu diarahkan ke halaman login', function () {
    $this->get('/dashboard')->assertRedirect('/');
});

test('user yang terautentikasi dengan role admin dapat mengakses halaman dashboard', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $this->actingAs($admin);

    $this->get('/dashboard')->assertOk();
});

test('user yang terautentikasi dengan role karyawan tidak dapat mengakses halaman dashboard', function () {
    $karyawan = User::factory()->create([
        'role' => 'karyawan',
    ]);

    $this->actingAs($karyawan);

    // Pastikan pengguna dengan role karyawan diarahkan ke dashboard
    $this->get('/dashboard')->assertRedirect('/presensi');
});