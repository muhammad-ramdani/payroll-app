<?php

use App\Models\User;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\Attendance;

test('user yang belum login tidak dapat mengakses halaman presensi', function () {
    $this->get('/presensi')->assertRedirect('/');
});

test('user yang terautentikasi role karyawan dapat mengakses halaman presensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/presensi')->assertOk();
});

test('user yang terautentikasi role admin tidak dapat mengakses halaman presensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/presensi')->assertRedirect('/dashboard');
});

test('karyawan tidak dapat melakukan presensi pulang sebelum presensi masuk', function () {
    $user = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($user);

    $attendance = Attendance::create([
        'user_id' => $user->id,
        'shift_type' => 'Pagi',
        'date' => now(),
        'status' => 'not_started',
    ]);
    
    $response = $this->patch("/presensi/{$attendance->id}", [
        'action' => 'clock_out',
    ]);
    
    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->toBeNull();
    expect($attendance->clock_out)->toBeNull();
    expect($attendance->status)->toBe('not_started');
});

test('karyawan dapat melakukan presensi masuk', function () {
    $user = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($user);

    $attendance = Attendance::create([
        'user_id' => $user->id,
        'shift_type' => 'Pagi',
        'date' => now(),
        'status' => 'not_started',
    ]);

    $response = $this->patch("/presensi/{$attendance->id}", [
        'action' => 'clock_in',
    ]);

    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->not->toBeNull();
    expect($attendance->clock_out)->toBeNull();
    expect($attendance->status)->toBe('working');
});

test('karyawan tidak dapat melakukan presensi masuk lebih dari sekali', function () {
    $user = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($user);

    $attendance = Attendance::create([
        'user_id' => $user->id,
        'shift_type' => 'Pagi',
        'date' => now(),
        'status' => 'not_started',
    ]);

    $firstClockIn = now()->format('H:i:s');

    $this->travelTo($firstClockIn);
    $this->patch("/presensi/{$attendance->id}", [
        'action' => 'clock_in',
    ]);

    $this->travel(10)->minutes();
    $response = $this->patch("/presensi/{$attendance->id}", [
        'action' => 'clock_in',
    ]);

    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->toBe($firstClockIn);
    expect($attendance->clock_out)->toBeNull();
    expect($attendance->status)->toBe('working');
});

test('karyawan dapat melakukan presensi pulang setelah presensi masuk', function () {
    $user = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($user);

    $attendance = Attendance::create([
        'user_id' => $user->id,
        'shift_type' => 'Pagi',
        'date' => now(),
        'status' => 'working',
        'clock_in' => now()->subHours(2),
    ]);

    $response = $this->patch("/presensi/{$attendance->id}", [
        'action' => 'clock_out',
    ]);

    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->not->toBeNull();
    expect($attendance->clock_out)->not->toBeNull();
    expect($attendance->status)->toBe('finished');
});

test('karyawan tidak dapat melakukan presensi pulang lebih dari sekali', function () {
    $user = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($user);

    $attendance = Attendance::create([
        'user_id' => $user->id,
        'shift_type' => 'Pagi',
        'date' => now(),
        'status' => 'working',
        'clock_in' => now()->subHours(2),
    ]);

    $firstClockOut = now()->format('H:i:s');

    $this->travelTo($firstClockOut);
    $this->patch("/presensi/{$attendance->id}", [
        'action' => 'clock_out',
    ]);

    $this->travel(10)->minutes();
    $response = $this->patch("/presensi/{$attendance->id}", [
        'action' => 'clock_out',
    ]);

    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->not->toBeNull();
    expect($attendance->clock_out)->toBe($firstClockOut);
    expect($attendance->status)->toBe('finished');
});

test('karyawan dapat melakukan presensi sakit', function () {
    $user = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($user);

    $attendance = Attendance::create([
        'user_id' => $user->id,
        'shift_type' => 'Pagi',
        'date' => now(),
        'status' => 'not_started',
    ]);

    $response = $this->patch("/presensi/{$attendance->id}", [
        'action' => 'sick',
    ]);

    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->toBeNull();
    expect($attendance->clock_out)->toBeNull();
    expect($attendance->status)->toBe('sick');
});

test('karyawan dapat melakukan presensi cuti', function () {
    $user = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($user);

    $attendance = Attendance::create([
        'user_id' => $user->id,
        'shift_type' => 'Pagi',
        'date' => now(),
        'status' => 'not_started',
    ]);

    $response = $this->patch("/presensi/{$attendance->id}", [
        'action' => 'leave',
    ]);

    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->toBeNull();
    expect($attendance->clock_out)->toBeNull();
    expect($attendance->status)->toBe('leave');
});

test('relasi user dari attendance berfungsi', function () {
    $user = User::factory()->create();
    $attendance = Attendance::factory()->create(['user_id' => $user->id]);

    expect($attendance->user)->toBeInstanceOf(User::class);
});