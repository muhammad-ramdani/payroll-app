<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama karyawan
            $table->string('phone')->nullable(); // Nomor telepon
            $table->string('address')->nullable(); // Alamat
            $table->date('hire_date'); // Tanggal bergabung
            $table->string('bank_name')->nullable(); // Nama bank
            $table->string('account_number')->nullable(); // Nomor rekening
            $table->string('account_name')->nullable(); // Nama pemilik rekening
            $table->unsignedMediumInteger('basic_salary'); // Gaji pokok
            $table->unsignedTinyInteger('paid_holidays'); // Jumlah hari libur yang dibayar
            $table->unsignedMediumInteger('daily_overtime_pay'); // Uang lebur harian
            // kolom potongan BPJS
            $table->unsignedTinyInteger('bpjs_health'); // Potongan BPJS Kesehatan 1%
            $table->unsignedTinyInteger('bpjs_employment'); // Potongan BPJS Ketenagakerjaan 3%
            // kolom potongan pajak
            $table->unsignedTinyInteger('income_tax'); // Potongan Pajak Penghasilan (PPh)
            $table->softDeletes(); // Kolom deleted_at untuk soft deletes
            $table->timestamps(); // Kolom created_at dan updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
