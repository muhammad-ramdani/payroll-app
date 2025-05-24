<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ShiftSwap extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_id', 
        'target_user_id', 
        'requester_shift_id',
        'target_shift_id',
        'status'
    ];

    public function requesterShift()
    {
        return $this->belongsTo(Shift::class, 'requester_shift_id');
    }

    public function targetShift()
    {
        return $this->belongsTo(Shift::class, 'target_shift_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }
}
