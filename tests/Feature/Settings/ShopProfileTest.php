<?php

use App\Models\User;

test('user yang belum login tidak dapat mengakses halaman toko pada settings', function () {
    $this->get('/settings/profile-toko')->assertRedirect('/');
});

test('user yang terautentikasi role admin dapat mengakses halaman toko pada settings', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/settings/profile-toko')->assertOk();
});

test('user yang terautentikasi role karyawan tidak dapat mengakses halaman toko pada settings', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/settings/profile-toko')->assertRedirect('');
});

test('admin yang dapat mengupdate toko', function () {
    $user = User::factory()->create(['role' => 'admin']);

    // akses halaman edit
    $this->actingAs($user)->get('/settings/profile-toko')->assertOk();

    // update data
    $payload = [
        'name' => 'Toko Baru',
        'address' => 'Jl. Baru No. 123',
        'phone' => '08123456789',
    ];
    $this->patch('/settings/profile-toko', $payload)->assertRedirect();
});