<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payroll extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'user_id',
        'period_month',
        'period_year',
        'total_attendance_days',
        'paid_holidays',
        'total_overtime_hours',
        'total_punctual_days',
        'total_late_days',
        'bonus_amount',
        'penalty_amount',
        'total_bonus',
        'total_penalty',
        'basic_salary',
        'transportation_allowance',
        'hourly_overtime_pay',
        'total_basic_salary',
        'total_overtime_pay',
        'gross_salary',
        'bpjs_health_percent',
        'bpjs_employment_percent',
        'income_tax_percent',
        'total_deduction_percent',
        'total_deductions',
        'net_salary',
        'salary_status',
        'confirmation_status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }
}