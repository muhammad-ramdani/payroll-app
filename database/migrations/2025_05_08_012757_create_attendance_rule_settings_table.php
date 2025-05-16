<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_bonus_penalty_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('bonus_amount');
            $table->unsignedInteger('penalty_amount');
            $table->timestamps();
        });

        Schema::create('attendance_rule_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('shift_type', ['Pagi', 'Siang']);
            $table->time('punctual_end');
            $table->time('late_threshold');
            $table->foreignId('attendance_bonus_penalty_id')->constrained('attendance_bonus_penalty_settings');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_rule_settings');
        Schema::dropIfExists('attendance_bonus_penalty_settings');
    }
};
