<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('user yang belum login tidak dapat mengakses halaman password pada settings', function () {
    $this->get('/settings/password')->assertRedirect('/');
});

test('user yang terautentikasi dapat mengakses halaman password pada settings', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/settings/password')->assertOk();
});

test('password dapat diperbarui', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/settings/password')
        ->put('/settings/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/password');

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

test('password yang benar harus dimasukkan untuk memperbarui password', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/settings/password')
        ->put('/settings/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect('/settings/password');
});