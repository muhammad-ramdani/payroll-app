<?php

use App\Models\User;

test('user yang belum login tidak dapat mengakses halaman monitoring presensi', function () {
    $this->get('/monitoring-presensi')->assertRedirect('/');
});

test('user yang terautentikasi role admin dapat mengakses halaman monitoring presensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/monitoring-presensi')->assertOk();
});

test('user yang terautentikasi role karyawan tidak dapat mengakses halaman monitoring presensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/monitoring-presensi')->assertRedirect('/presensi');
});
