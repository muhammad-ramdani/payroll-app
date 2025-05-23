<?php

use App\Models\User;
use App\Models\Payroll;

test('user yang belum login tidak dapat mengakses halaman penggajian', function () {
    $this->get('/penggajian')->assertRedirect('/');
});

test('user yang terautentikasi role karyawan dapat mengakses halaman penggajian', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/penggajian')->assertOk();
});

test('user yang terautentikasi role admin tidak dapat mengakses penggajian', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/penggajian')->assertRedirect('/dashboard');
});

test('karyawan dapat dapat mengganti status konfirmasi dari pending_confirmation menjadi received', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $payroll = Payroll::factory()->create([
        'user_id' => $user->id,
        'confirmation_status' => 'pending_confirmation',
    ]);

    $response = $this->patch("penggajian/confirmation/{$payroll->id}", [
        'confirmation_status' => 'received',
    ]);

    $response->assertOk();
});