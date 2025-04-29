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
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('restrict');
            
            // Periode penggajian
            $table->tinyInteger('period_month')->comment('Bulan penggajian 1-12');
            $table->smallInteger('period_year')->comment('Tahun penggajian');
            
            // Data kehadiran dan komponen gaji
            $table->unsignedSmallInteger('total_attendance_days')->nullable();
            $table->unsignedTinyInteger('paid_holidays')->nullable();
            $table->unsignedSmallInteger('total_overtime_days')->nullable();
            
            // Komponen penghasilan
            $table->unsignedMediumInteger('basic_salary')->nullable();
            $table->unsignedMediumInteger('daily_overtime_pay')->nullable();
            $table->unsignedMediumInteger('total_basic_salary')->nullable();
            $table->unsignedMediumInteger('total_overtime_pay')->nullable();
            $table->unsignedMediumInteger('gross_salary')->nullable();
            
            // Potongan
            $table->unsignedTinyInteger('bpjs_health_percent')->nullable();
            $table->unsignedTinyInteger('bpjs_employment_percent')->nullable();
            $table->unsignedTinyInteger('income_tax_percent')->nullable();
            $table->unsignedTinyInteger('total_deduction_percent')->nullable();
            $table->unsignedMediumInteger('total_deductions')->nullable();
            
            // Gaji bersih
            $table->unsignedMediumInteger('net_salary')->nullable();
            
            // Status penggajian
            $table->enum('status', ['uncalculated', 'unpaid', 'paid'])->default('uncalculated');
            
            $table->timestamps();
            
            // Unique constraint untuk menghindari duplikasi data
            $table->unique(['employee_id', 'period_month', 'period_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
