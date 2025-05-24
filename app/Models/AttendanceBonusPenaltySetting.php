<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AttendanceBonusPenaltySetting extends Model
{
    use HasFactory;

    protected $fillable = ['bonus_amount', 'penalty_amount'];
}
