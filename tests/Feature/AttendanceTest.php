<?php

use App\Models\User;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\Attendance;

test('user yang belum login tidak dapat mengakses halaman absensi', function () {
    $this->get('/absensi')->assertRedirect('/');
});

test('user yang terautentikasi role karyawan dapat mengakses halaman absensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/absensi')->assertOk();
});

test('user yang terautentikasi role admin tidak dapat mengakses halaman absensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/absensi')->assertRedirect('/dashboard');
});

test('karyawan tidak dapat melakukan absensi pulang sebelum absensi masuk', function () {
    $user = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($user);

    $attendance = Attendance::create([
        'user_id' => $user->id,
        'shift_type' => 'Pagi',
        'date' => now(),
        'status' => 'not_started',
    ]);
    
    $response = $this->patch("/absensi/{$attendance->id}", [
        'action' => 'clock_out',
    ]);
    
    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->toBeNull();
    expect($attendance->clock_out)->toBeNull();
    expect($attendance->status)->toBe('not_started');
});

test('karyawan dapat melakukan absensi masuk', function () {
    $user = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($user);

    $attendance = Attendance::create([
        'user_id' => $user->id,
        'shift_type' => 'Pagi',
        'date' => now(),
        'status' => 'not_started',
    ]);

    $response = $this->patch("/absensi/{$attendance->id}", [
        'action' => 'clock_in',
    ]);

    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->not->toBeNull();
    expect($attendance->clock_out)->toBeNull();
    expect($attendance->status)->toBe('working');
});

test('karyawan tidak dapat melakukan absensi masuk lebih dari sekali', function () {
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
    $this->patch("/absensi/{$attendance->id}", [
        'action' => 'clock_in',
    ]);

    $this->travel(10)->minutes();
    $response = $this->patch("/absensi/{$attendance->id}", [
        'action' => 'clock_in',
    ]);

    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->toBe($firstClockIn);
    expect($attendance->clock_out)->toBeNull();
    expect($attendance->status)->toBe('working');
});

test('karyawan dapat melakukan absensi pulang setelah absensi masuk', function () {
    $user = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($user);

    $attendance = Attendance::create([
        'user_id' => $user->id,
        'shift_type' => 'Pagi',
        'date' => now(),
        'status' => 'working',
        'clock_in' => now()->subHours(2),
    ]);

    $response = $this->patch("/absensi/{$attendance->id}", [
        'action' => 'clock_out',
    ]);

    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->not->toBeNull();
    expect($attendance->clock_out)->not->toBeNull();
    expect($attendance->status)->toBe('finished');
});

test('karyawan tidak dapat melakukan absensi pulang lebih dari sekali', function () {
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
    $this->patch("/absensi/{$attendance->id}", [
        'action' => 'clock_out',
    ]);

    $this->travel(10)->minutes();
    $response = $this->patch("/absensi/{$attendance->id}", [
        'action' => 'clock_out',
    ]);

    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->not->toBeNull();
    expect($attendance->clock_out)->toBe($firstClockOut);
    expect($attendance->status)->toBe('finished');
});

test('karyawan dapat melakukan absensi sakit', function () {
    $user = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($user);

    $attendance = Attendance::create([
        'user_id' => $user->id,
        'shift_type' => 'Pagi',
        'date' => now(),
        'status' => 'not_started',
    ]);

    $response = $this->patch("/absensi/{$attendance->id}", [
        'action' => 'sick',
    ]);

    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->toBeNull();
    expect($attendance->clock_out)->toBeNull();
    expect($attendance->status)->toBe('sick');
});

test('karyawan dapat melakukan absensi cuti', function () {
    $user = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($user);

    $attendance = Attendance::create([
        'user_id' => $user->id,
        'shift_type' => 'Pagi',
        'date' => now(),
        'status' => 'not_started',
    ]);

    $response = $this->patch("/absensi/{$attendance->id}", [
        'action' => 'leave',
    ]);

    $response->assertOk();
    $attendance->refresh();
    expect($attendance->clock_in)->toBeNull();
    expect($attendance->clock_out)->toBeNull();
    expect($attendance->status)->toBe('leave');
});