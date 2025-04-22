<?php

use App\Models\User;

test('Halaman login dapat ditampilkan', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});

test('user dapat login melalui halaman login', function () {
    $user = User::factory()->create();

    $response = $this->post('/', [
        'username' => $user->username,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('user tidak bisa masuk dengan password yang salah', function () {
    $user = User::factory()->create();

    $this->post('/', [
        'username' => $user->username,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('user bisa logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});