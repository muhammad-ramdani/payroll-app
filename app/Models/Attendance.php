<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// Models/Attendance.php
class Attendance extends Model
{
    use HasFactory;

    protected $fillable = ['user_id','date','clock_in','clock_out','status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
