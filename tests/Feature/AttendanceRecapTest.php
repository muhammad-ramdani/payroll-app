<?php

use App\Models\User;

test('user yang belum login tidak dapat mengakses halaman rekap presensi', function () {
    $this->get('/rekap-presensi')->assertRedirect('/');
});

test('user yang terautentikasi role karyawan dapat mengakses halaman rekap presensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/rekap-presensi')->assertOk();
});

test('user yang terautentikasi role admin tidak dapat mengakses halaman rekap presensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/rekap-presensi')->assertRedirect('/dashboard');
});