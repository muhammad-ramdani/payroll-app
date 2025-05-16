<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceBonusPenaltySetting extends Model
{
    protected $fillable = ['bonus_amount', 'penalty_amount'];
}
