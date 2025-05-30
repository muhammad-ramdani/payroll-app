<?php

use App\Models\User;

test('user yang belum login tidak dapat mengakses halaman laporan presensi', function () {
    $this->get('/laporan-presensi-karyawan')->assertRedirect('/');
});

test('user yang terautentikasi role karyawan dapat mengakses halaman laporan presensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/laporan-presensi-karyawan')->assertOk();
});

test('user yang terautentikasi role admin tidak dapat mengakses halaman laporan presensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/laporan-presensi-karyawan')->assertRedirect('/dashboard');
});
