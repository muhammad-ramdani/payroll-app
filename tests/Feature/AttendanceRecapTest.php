<?php

use App\Models\User;

test('user yang belum login tidak dapat mengakses halaman rekap absensi', function () {
    $this->get('/rekap-absensi')->assertRedirect('/');
});

test('user yang terautentikasi role karyawan dapat mengakses halaman rekap absensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/rekap-absensi')->assertOk();
});

test('user yang terautentikasi role admin tidak dapat mengakses halaman rekap absensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/rekap-absensi')->assertRedirect('/dashboard');
});