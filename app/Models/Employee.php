<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'phone',
        'address',
        'hire_date',
        'bank_name',
        'account_number',
        'account_name',
        'basic_salary',
        'paid_holidays',
        'daily_overtime_pay',
        'bpjs_health',
        'bpjs_employment',
        'income_tax',
    ];
}
