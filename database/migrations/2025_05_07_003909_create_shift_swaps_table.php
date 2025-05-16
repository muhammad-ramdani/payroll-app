<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shift_swaps', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('requester_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('target_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('requester_shift_id')->constrained('shifts')->onDelete('cascade');
            $table->foreignId('target_shift_id')->constrained('shifts')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_swaps');
    }
};
