<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    protected $fillable = ['user_id', 'shift_type'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
