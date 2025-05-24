<?php

use App\Models\User;
use App\Models\Payroll;
use App\Models\ShopProfile;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;

test('user yang belum login tidak dapat mengakses halaman Slip Gaji PDF', function () {
    $this->get('/penggajian/pdf/1')->assertRedirect('/');
});

test('user yang terautentikasi (admin) dapat mengakses halaman Slip Gaji PDF', function () {
    // Setup data
    $shopProfile = ShopProfile::factory()->create();
    $admin = User::factory()->create(['role' => 'admin']);
    $karyawan = User::factory()->create(['role' => 'karyawan']);
    $employee = Employee::factory()->create(['user_id' => $karyawan->id]);
    $payroll = Payroll::factory()->create(['user_id' => $employee->user_id]);

    // Akses sebagai admin
    $response = $this->actingAs($admin)->get("/penggajian/pdf/{$payroll->id}");
    
    // Assert response
    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/pdf');
});

// test('user yang terautentikasi (employee) dapat mengakses slip gaji sendiri', function () {
//     $shopProfile = ShopProfile::factory()->create();
//     $admin    = User::factory()->create(['role' => 'admin']);
//     $karyawan = User::factory()->create(['role' => 'karyawan']);
//     $employee = Employee::factory()->create(['user_id' => $karyawan->id]);
//     $payroll  = Payroll::factory()->create(['user_id' => $employee->user_id]);

//     // Akses sebagai employee
//     $response = $this->actingAs($karyawan)->get("/penggajian/pdf/{$payroll->id}");

//     // Assert response
//     $response->assertOk();
//     $response->assertHeader('Content-Type', 'application/pdf');
// });

test('employee tidak bisa mengakses slip gaji karyawan lain', function () {
    $shopProfile = ShopProfile::factory()->create();
    $admin = User::factory()->create(['role' => 'admin']);
    $karyawan1 = User::factory()->create(['role' => 'karyawan']);
    $karyawan2 = User::factory()->create(['role' => 'karyawan']);
    $employee = Employee::factory()->create(['user_id' => $karyawan1->id]);
    $payroll = Payroll::factory()->create(['user_id' => $employee->user_id]);

    // Akses sebagai employee2 mencoba akses slip gaji employee1
    $response = $this->actingAs($karyawan2)->get("/penggajian/pdf/{$payroll->id}");
    
    // Assert forbidden access
    $response->assertForbidden();
});