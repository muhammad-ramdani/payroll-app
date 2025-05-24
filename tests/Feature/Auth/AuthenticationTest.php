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

// test('validasi form login membutuhkan username dan password', function () {
//     // Test validasi required
//     $response = $this->post('/', []);
    
//     $response->assertInvalid(['username', 'password']);
// });

// test('throttle key menggunakan kombinasi username dan ip', function () {
//     $request = new \App\Http\Requests\Auth\LoginRequest();
//     $request->replace(['username' => 'testuser']);
    
//     // Mock IP address
//     $request->server->set('REMOTE_ADDR', '192.168.0.1');
    
//     $this->assertEquals('testuser|192.168.0.1', $request->throttleKey());
// });

test('user terkunci setelah 5 percobaan gagal', function () {
    $user = User::factory()->create();

    // Lakukan 5 percobaan gagal
    for ($i = 0; $i < 5; $i++) {
        $this->post('/', [
            'username' => $user->username,
            'password' => 'wrong-password',
        ]);
    }

    // Percobaan ke-6 harus error throttling
    $response = $this->post('/', [
        'username' => $user->username,
        'password' => 'wrong-password',
    ]);
    
    $response->assertInvalid('username');
});

// test('remember me functionality bekerja', function () {
//     $user = User::factory()->create();

//     $response = $this->post('/', [
//         'username' => $user->username,
//         'password' => 'password',
//         'remember' => 'on',
//     ]);

//     $this->assertAuthenticated();
//     $response->assertCookie(Auth::guard()->getRecallerName());
// });

// test('event lockout terpicu saat throttling', function () {
//     Event::fake();
    
//     $user = User::factory()->create();

//     // Lakukan 6 percobaan gagal
//     for ($i = 0; $i < 6; $i++) {
//         $this->post('/', [
//             'username' => $user->username,
//             'password' => 'wrong-password',
//         ]);
//     }

//     Event::assertDispatched(Lockout::class);
// });

// test('rate limiter terreset setelah login berhasil', function () {
//     $user = User::factory()->create();

//     // Lakukan 2 percobaan gagal
//     for ($i = 0; $i < 2; $i++) {
//         $this->post('/', [
//             'username' => $user->username,
//             'password' => 'wrong-password',
//         ]);
//     }

//     // Login sukses
//     $this->post('/', [
//         'username' => $user->username,
//         'password' => 'password',
//     ]);

//     // Cek hitungan percobaan gagal
//     $this->assertEquals(0, RateLimiter::attempts(
//         Str::transliterate(Str::lower($user->username).'|'.$this->app['request']->ip()
//     ));
// });