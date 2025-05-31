<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('restrict');
            
            // Periode penggajian
            $table->tinyInteger('period_month');
            $table->smallInteger('period_year');
            
            // Data kehadiran dan komponen gaji
            $table->unsignedSmallInteger('total_attendance_days')->nullable();
            $table->unsignedTinyInteger('paid_holidays')->nullable();
            $table->unsignedSmallInteger('total_overtime_hours')->nullable();
            
            // Komponen bonus/penalty
            $table->unsignedMediumInteger('bonus_amount')->nullable();
            $table->unsignedMediumInteger('penalty_amount')->nullable();
            $table->unsignedSmallInteger('total_punctual_days')->nullable();
            $table->unsignedSmallInteger('total_late_days')->nullable();
            $table->unsignedMediumInteger('total_bonus')->nullable();
            $table->unsignedMediumInteger('total_penalty')->nullable();

            // Komponen penghasilan
            $table->unsignedMediumInteger('basic_salary')->nullable();
            $table->unsignedMediumInteger('hourly_overtime_pay')->nullable();
            $table->unsignedMediumInteger('transportation_allowance')->nullable();
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
            $table->enum('salary_status', ['uncalculated', 'unpaid', 'paid_transfer', 'paid_cash'])->default('uncalculated');
            $table->enum('confirmation_status', ['blank', 'pending_confirmation', 'received'])->default('blank');
            
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['user_id', 'period_month', 'period_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
