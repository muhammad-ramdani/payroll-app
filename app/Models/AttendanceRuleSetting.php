<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AttendanceRuleSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'shift_type',
        'punctual_end',
        'late_threshold',
        'attendance_bonus_penalty_id'
    ];

    public function attendanceBonusPenaltySetting()
    {
        return $this->belongsTo(AttendanceBonusPenaltySetting::class, 'attendance_bonus_penalty_id');
    }
}
