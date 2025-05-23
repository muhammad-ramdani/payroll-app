<?php

use App\Models\User;

test('user yang belum login tidak dapat mengakses halaman laporan absensi', function () {
    $this->get('/laporan-absensi-karyawan')->assertRedirect('/');
});

test('user yang terautentikasi role karyawan dapat mengakses halaman laporan absensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/laporan-absensi-karyawan')->assertOk();
});

test('user yang terautentikasi role admin tidak dapat mengakses halaman laporan absensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/laporan-absensi-karyawan')->assertRedirect('/dashboard');
});
