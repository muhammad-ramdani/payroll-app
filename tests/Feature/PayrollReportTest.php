<?php

use App\Models\User;

test('user yang belum login tidak dapat mengakses halaman laporan penggajian', function () {
    $this->get('/laporan-penggajian')->assertRedirect('/');
});

test('user yang terautentikasi role admin dapat mengakses halaman laporan penggajian', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/laporan-penggajian')->assertOk();
});

test('user yang terautentikasi role karyawan tidak dapat mengakses halaman laporan penggajian', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/laporan-penggajian')->assertRedirect('/presensi');
});
