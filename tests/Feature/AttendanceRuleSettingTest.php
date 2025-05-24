<?php

use App\Models\User;
use App\Models\AttendanceBonusPenaltySetting;
use App\Models\AttendanceRuleSetting;

test('user yang belum login tidak dapat mengakses halaman Aturan Absensi', function () {
    $this->get('/aturan-absensi')->assertRedirect('/');
});

test('user yang terautentikasi role admin dapat mengakses halaman Aturan Absensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'admin']));

    $this->get('/aturan-absensi')->assertOk();
});

test('user yang terautentikasi role karyawan tidak dapat mengakses halaman Aturan Absensi', function () {
    $this->actingAs($user = User::factory()->create(['role' => 'karyawan']));

    $this->get('/aturan-absensi')->assertRedirect('/absensi');
});

test('admin dapat mengupdate Aturan Absensi', function () {
    // Buat data dummy yang akan diupdate
    $bonusPenalty = AttendanceBonusPenaltySetting::factory()->create();
    $rule1 = AttendanceRuleSetting::factory()->create(['id' => 1, 'attendance_bonus_penalty_id' => $bonusPenalty->id]);
    $rule2 = AttendanceRuleSetting::factory()->create(['id' => 2, 'attendance_bonus_penalty_id' => $bonusPenalty->id]);

    $user = User::factory()->create(['role' => 'admin']);
    
    // Payload sesuai dengan validasi controller
    $payload = [
        'attendanceRules' => [
            [
                'id' => 1,
                'punctual_end' => '07:25',
                'late_threshold' => '08:10',
            ],
            [
                'id' => 2,
                'punctual_end' => '12:25',
                'late_threshold' => '13:10',
            ],
        ],
        'bonus_penalty' => [
            'id' => 1,
            'bonus_amount' => 10000,
            'penalty_amount' => 8000,
        ],
    ];

    // Kirim request dan assert status OK (200)
    $this->actingAs($user)
        ->patch('/aturan-absensi', $payload)
        ->assertOk(); // Controller tidak return redirect, sehingga assertOk()

    // Assert data di database telah berubah
    $this->assertDatabaseHas('attendance_rule_settings', [
        'id' => 1,
        'punctual_end' => '07:25',
        'late_threshold' => '08:10',
        'attendance_bonus_penalty_id' => '1',
    ]);

    $this->assertDatabaseHas('attendance_rule_settings', [
        'id' => 2,
        'punctual_end' => '12:25',
        'late_threshold' => '13:10',
        'attendance_bonus_penalty_id' => '1',
    ]);

    $this->assertDatabaseHas('attendance_bonus_penalty_settings', [
        'id' => 1,
        'bonus_amount' => 10000,
        'penalty_amount' => 8000,
    ]);
});

test('model AttendanceRuleSetting memiliki relasi ke attendanceBonusPenaltySetting', function () {
    $attendanceRuleSettings = AttendanceRuleSetting::factory()->create();
    
    $this->assertInstanceOf(AttendanceBonusPenaltySetting::class, $attendanceRuleSettings->attendanceBonusPenaltySetting);
});