<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'period_month',
        'period_year',
        'total_attendance_days',
        'paid_holidays',
        'total_overtime_days',
        'basic_salary',
        'daily_overtime_pay',
        'total_basic_salary',
        'total_overtime_pay',
        'gross_salary',
        'bpjs_health_percent',
        'bpjs_employment_percent',
        'income_tax_percent',
        'total_deduction_percent',
        'total_deductions',
        'net_salary',
        'status'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class)->withTrashed();
    }

    // protected $casts = [
    //     'period_month' => 'integer',
    //     'period_year' => 'integer',
    //     'basic_salary' => 'integer',
    //     'daily_overtime_pay' => 'integer',
    //     'total_basic_salary' => 'integer',
    //     'total_overtime_pay' => 'integer',
    //     'gross_salary' => 'integer',
    //     'total_deduction_percent' => 'integer',
    //     'total_deductions' => 'integer',
    //     'net_salary' => 'integer',
    //     'created_at' => 'datetime:Y-m-d',
    //     'updated_at' => 'datetime:Y-m-d',
    // ];
    
    /**
     * Unique constraint validation
     */
    public static function existsForPeriod($employeeId, $month, $year): bool
    {
        return self::where('employee_id', $employeeId)
            ->where('period_month', $month)
            ->where('period_year', $year)
            ->exists();
    }
}