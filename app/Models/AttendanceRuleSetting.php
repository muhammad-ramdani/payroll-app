<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceRuleSetting extends Model
{
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
