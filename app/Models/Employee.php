<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Employee extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $fillable = [
        'id',
        'user_id',
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
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    protected static function booted(): void
    {
        static::deleting(function (Employee $employee) {
            if (!$employee->isForceDeleting()) {
                $employee->user->shifts()->forceDelete();
                $employee->user()->delete();
            }
        });
    }
}