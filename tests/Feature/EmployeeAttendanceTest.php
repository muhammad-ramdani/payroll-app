<?php

use App\Models\User;

test('tamu diarahkan ke halaman login', function () {
    $this->get('/absensi')->assertRedirect('/');
});

test('user yang terautentikasi dengan role admin dan karyawan dapat mengakses halaman absensi karyawan', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/absensi')->assertOk();
});