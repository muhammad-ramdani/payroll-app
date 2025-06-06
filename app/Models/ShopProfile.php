<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ShopProfile extends Model
{
    use HasFactory;

    protected $fillable = ['shop_name','address','phone'];
}
