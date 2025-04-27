<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeAttendance extends Model
{
    use HasFactory;

    protected $fillable = ['employee_id','date','clock_in','clock_out','status'];

    // Relasi ke Employee
    public function employee()
    {
        return $this->belongsTo(Employee::class)->withTrashed();
    }
}
