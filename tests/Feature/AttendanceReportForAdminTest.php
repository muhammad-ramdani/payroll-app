<?php

use App\Models\User;

test('user yang belum login tidak dapat mengakses halaman laporan presensi', function () {
    $this->get('/laporan-presensi-admin')->assertRedirect('/');
});

test('user yang terautentikasi role admin dapat mengakses halaman laporan presensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/laporan-presensi-admin')->assertOk();
});

test('user yang terautentikasi role karyawan tidak dapat mengakses halaman laporan presensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/laporan-presensi-admin')->assertRedirect('/presensi');
});
