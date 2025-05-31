<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->uuid('id');
            $table->foreignUuid('user_id')->constrained()->onDelete('restrict');
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->date('hire_date');
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->unsignedMediumInteger('basic_salary');
            $table->unsignedTinyInteger('paid_holidays');
            $table->unsignedMediumInteger('hourly_overtime_pay');
            $table->unsignedMediumInteger('transportation_allowance');
            $table->unsignedTinyInteger('bpjs_health');
            $table->unsignedTinyInteger('bpjs_employment');
            $table->unsignedTinyInteger('income_tax');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
