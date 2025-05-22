<?php

use App\Models\User;
use App\Models\Employee;
use App\Models\Shift;

test('user yang belum login tidak dapat mengakses halaman shift di karyawan', function () {
    $this->get('/shift-karyawan')->assertRedirect('/');
});

test('user yang terautentikasi role karyawan dapat mengakses halaman shift di karyawan', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/shift-karyawan')->assertOk();
});

test('user yang terautentikasi role admin tidak dapat mengakses halaman shift di karyawan', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/shift-karyawan')->assertRedirect('/dashboard');
});

test('karyawan dapat meminta tukar shift', function () {
    $requester = User::factory()->create(['role' => 'karyawan']);
    $requesterShift = Shift::factory()->create(['user_id' => $requester->id]);

    $targetUser = User::factory()->create(['role' => 'karyawan']);
    $targetShift = Shift::factory()->create(['user_id' => $targetUser->id]);

    $this->actingAs($requester);

    $response = $this->post('/swap-requests', [
        'shift_id' => $targetShift->id,
    ]);
    
    $response->assertOk();

    expect(DB::table('shift_swaps')->latest('id')->first())->toMatchArray([
        'requester_id' => $requester->id,
        'target_user_id' => $targetUser->id,
        'requester_shift_id' => $requesterShift->id,
        'target_shift_id' => $targetShift->id,
        'status' => 'pending',
    ]);
});