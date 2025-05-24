<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Shift;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShiftSwapFactory extends Factory
{
    public function definition(): array
    {
        return [
            'requester_id' => User::factory(),
            'target_user_id' => User::factory(),
            'requester_shift_id' => Shift::factory(),
            'target_shift_id' => Shift::factory(),
            'status' => 'pending',
        ];
    }
}