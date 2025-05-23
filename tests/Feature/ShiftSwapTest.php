<?php

use App\Models\User;
use App\Models\Shift;
use App\Models\ShiftSwap;

test('user yang belum login tidak dapat mengakses halaman permintaan tukar shift', function () {
    $this->get('/permintaan-tukar-shift')->assertRedirect('/');
});

test('user yang terautentikasi role karyawan dapat mengakses halaman permintaan tukar shift', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/permintaan-tukar-shift')->assertOk();
});

test('user yang terautentikasi role admin tidak dapat mengakses halaman permintaan tukar shift', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/permintaan-tukar-shift')->assertRedirect('/dashboard');
});

test('karyawan yang mendapatkan permintaan tukar shift dapat menekan tombol boleh', function () {
    $requester   = User::factory()->create(['role' => 'karyawan']);
    $targetUser  = User::factory()->create(['role' => 'karyawan']);

    // Buat shift untuk kedua user
    $requesterShift = Shift::factory()->create(['user_id' => $requester->id]);
    $targetShift    = Shift::factory()->create(['user_id' => $targetUser->id]);

    // Simpan ID asli untuk nanti dicek
    $originalRequesterUserId = $requesterShift->user_id;
    $originalTargetUserId    = $targetShift->user_id;

    // Buat permintaan tukar shift
    $swapRequest = ShiftSwap::create([
        'requester_id'      => $requester->id,
        'target_user_id'    => $targetUser->id,
        'requester_shift_id'=> $requesterShift->id,
        'target_shift_id'   => $targetShift->id,
        'status'            => 'pending',
    ]);

    // Login sebagai TARGET USER (penerima permintaan)
    $this->actingAs($targetUser);

    // Kirim request ke endpoint approve
    $response = $this->post("/permintaan-tukar-shift/{$swapRequest->id}/approve");

    $response->assertOk();

    $this->assertDatabaseMissing('shift_swaps', [
        'id' => $swapRequest->id,
    ]);

    // Pastikan user_id kedua shift sudah tertukar
    $this->assertDatabaseHas('shifts', [
        'id'      => $requesterShift->id,
        'user_id' => $originalTargetUserId, // semula milik targetUser
    ]);

    $this->assertDatabaseHas('shifts', [
        'id'      => $targetShift->id,
        'user_id' => $originalRequesterUserId, // semula milik requester
    ]);
});

test('karyawan yang mendapatkan permintaan tukar shift dapat menekan tombol tidak', function () {
    $requester   = User::factory()->create(['role' => 'karyawan']);
    $targetUser  = User::factory()->create(['role' => 'karyawan']);

    // Buat shift untuk kedua user
    $requesterShift = Shift::factory()->create(['user_id' => $requester->id]);
    $targetShift    = Shift::factory()->create(['user_id' => $targetUser->id]);

    // Buat permintaan tukar shift
    $swapRequest = ShiftSwap::create([
        'requester_id'      => $requester->id,
        'target_user_id'    => $targetUser->id,
        'requester_shift_id'=> $requesterShift->id,
        'target_shift_id'   => $targetShift->id,
        'status'            => 'pending',
    ]);

    // Login sebagai TARGET USER (penerima permintaan)
    $this->actingAs($targetUser);

    // Kirim request ke endpoint reject
    $response = $this->post("/permintaan-tukar-shift/{$swapRequest->id}/reject");

    $response->assertOk();

    // Pastikan permintaan sudah dihapus
    $this->assertDatabaseMissing('shift_swaps', [
        'id' => $swapRequest->id,
    ]);
});