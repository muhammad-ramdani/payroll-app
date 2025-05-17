<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shift extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'shift_type'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
