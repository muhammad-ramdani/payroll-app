<?php

use App\Models\User;

test('tamu diarahkan ke halaman login', function () {
    $this->get('/laporan-absensi')->assertRedirect('/');
});

test('user yang terautentikasi dengan role admin dan karyawan dapat mengakses halaman laporan absensi', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/laporan-absensi')->assertOk();
});