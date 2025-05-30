<?php

use App\Models\User;

test('halaman profil dapat ditampilkan', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/settings/profile-akun');

    $response->assertOk();
});

test('informasi profil dapat diperbarui', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile-akun', [
            'name' => 'Test User',
            'username' => 'testuser',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile-akun');

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->username)->toBe('testuser');
});
