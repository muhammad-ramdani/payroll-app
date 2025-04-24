<?php

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// Test untuk fitur List & Detail Data Karyawan

test('tamu diarahkan ke halaman login', function () {
    $this->get('/data-karyawan')->assertRedirect('/');
});

test('user yang terautentikasi dengan role admin dapat mengakses halaman data-karyawan', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $this->get('/data-karyawan')->assertOk();
});

test('user yang terautentikasi dengan role karyawan tidak dapat mengakses halaman data-karyawan', function () {
    $karyawan = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($karyawan);

    $this->get('/data-karyawan')->assertRedirect('/absensi');
});

// Test untuk fitur Create Data Karyawan

test('tamu diarahkan ke halaman login saat menambah data karyawan', function () {
    $payload = Employee::factory()->raw();
    $this->post('/data-karyawan', $payload)->assertRedirect('/');
});

test('admin dapat menambah data karyawan dengan data valid', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $payload = Employee::factory()->raw();
    $response = $this->postJson('/data-karyawan', $payload);

    // Sesuai implementasi, status sukses adalah 200 OK
    $response->assertStatus(200)->assertJsonFragment([
        'name'  => $payload['name'],
        'phone' => $payload['phone'],
    ]);

    $this->assertDatabaseHas('employees', [
        'name'  => $payload['name'],
        'phone' => $payload['phone'],
    ]);
});

test('admin gagal menambah data karyawan jika data tidak lengkap atau salah', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $payload = ['name' => '', 'hire_date' => null];
    $response = $this->postJson('/data-karyawan', $payload);

    $response->assertStatus(422)->assertJsonValidationErrors(['name', 'hire_date']);
});

test('user dengan role karyawan tidak dapat menambah data karyawan', function () {
    $karyawan = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($karyawan);

    $payload = Employee::factory()->raw();
    $this->post('/data-karyawan', $payload)->assertRedirect('/absensi');
});

// Test untuk fitur Edit Data Karyawan

test('tamu diarahkan ke halaman login saat mengedit data karyawan', function () {
    $employee = Employee::factory()->create();
    $payload  = Employee::factory()->raw();

    $this->put("/data-karyawan/{$employee->id}", $payload)->assertRedirect('/');
});

test('admin dapat mengedit data karyawan dengan data valid', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $employee = Employee::factory()->create();
    $payload  = Employee::factory()->raw();

    $response = $this->putJson("/data-karyawan/{$employee->id}", $payload);
    $response->assertStatus(200)->assertJsonFragment([
        'id'    => $employee->id,
        'name'  => $payload['name'],
        'phone' => $payload['phone'],
    ]);

    $this->assertDatabaseHas('employees', [
        'id'    => $employee->id,
        'name'  => $payload['name'],
        'phone' => $payload['phone'],
    ]);
});

test('admin gagal mengedit data karyawan jika data tidak lengkap atau salah', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $employee = Employee::factory()->create();
    $payload  = ['name' => '', 'hire_date' => null];
    $response = $this->putJson("/data-karyawan/{$employee->id}", $payload);

    $response->assertStatus(422)->assertJsonValidationErrors(['name', 'hire_date']);
});

test('user dengan role karyawan tidak dapat mengedit data karyawan', function () {
    $karyawan = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($karyawan);

    $employee = Employee::factory()->create();
    $payload  = Employee::factory()->raw();
    $this->put("/data-karyawan/{$employee->id}", $payload)->assertRedirect('/absensi');
});

// Test untuk fitur Detail Data Karyawan

test('tamu diarahkan ke halaman login saat melihat detail data karyawan', function () {
    $employee = Employee::factory()->create();
    $this->get("/data-karyawan/{$employee->id}")->assertRedirect('/');
});

test('admin dapat melihat detail data karyawan', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $employee = Employee::factory()->create();
    $response = $this->getJson("/data-karyawan/{$employee->id}");

    $response->assertStatus(200)->assertJsonFragment([
        'id'    => $employee->id,
        'name'  => $employee->name,
        'phone' => $employee->phone,
    ]);
});

test('user dengan role karyawan tidak dapat melihat detail data karyawan', function () {
    $karyawan = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($karyawan);

    $employee = Employee::factory()->create();
    $this->get("/data-karyawan/{$employee->id}")->assertRedirect('/absensi');
});

// Test untuk fitur Delete Data Karyawan

test('tamu diarahkan ke halaman login saat menghapus data karyawan', function () {
    $employee = Employee::factory()->create();

    $this->delete("/data-karyawan/{$employee->id}")->assertRedirect('/');
});

test('admin dapat menghapus data karyawan', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin);

    $employee = Employee::factory()->create();

    $response = $this->deleteJson("/data-karyawan/{$employee->id}");
    $response->assertStatus(200);

    $this->assertSoftDeleted('employees', [
        'id' => $employee->id,
    ]);
});

test('user dengan role karyawan tidak dapat menghapus data karyawan', function () {
    $karyawan = User::factory()->create(['role' => 'karyawan']);
    $this->actingAs($karyawan);

    $employee = Employee::factory()->create();

    $this->delete("/data-karyawan/{$employee->id}")->assertRedirect('/absensi');
});