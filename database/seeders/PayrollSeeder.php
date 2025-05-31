<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\Attendance;
use App\Models\AttendanceRuleSetting;
use App\Models\AttendanceBonusPenaltySetting;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PayrollSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::with('user')->get();
        $bonusPenaltySettings = AttendanceBonusPenaltySetting::first();

        // Loop untuk setiap karyawan
        foreach ($employees as $employee) {
            for ($i = 0; $i < 7; $i++) {
                $date = Carbon::now()->startOfMonth()->subMonths($i);
                $isLastMonth = $i === 0;

                if ($i === 0) {
                    $confirmationStatus = 'blank';
                } elseif ($i === 1) {
                    $confirmationStatus = 'pending_confirmation';
                } else {
                    $confirmationStatus = 'received';
                }

                // Data dasar payroll
                $payrollData = [
                    'user_id'             => $employee->user_id,
                    'period_month'        => $date->month,
                    'period_year'         => $date->year,
                    'salary_status'       => $isLastMonth ? 'uncalculated' : 'paid_cash',
                    'confirmation_status' => $confirmationStatus,
                ];

                // Hanya hitung untuk bulan yang sudah lewat (bukan bulan ini)
                if (!$isLastMonth) {
                    // Ambil data presensi bulan tersebut
                    $attendances = Attendance::where('user_id', $employee->user_id)
                        ->whereMonth('date', $date->month)
                        ->whereYear('date', $date->year)
                        ->get();

                    /* 
                     * [1] HITUNG KETEPATAN WAKTU & KETERLAMBATAN
                     * Sama seperti sebelumnya
                     */
                    $shiftCounts = $attendances->groupBy('shift_type')->map(function ($group) {
                        return collect([
                            'punctual' => 0,
                            'late'     => 0,
                            'total'    => $group->where('status', 'finished')->count(),
                        ]);
                    });

                    $rules = AttendanceRuleSetting::with('attendanceBonusPenaltySetting')
                        ->get()
                        ->keyBy('shift_type');

                    foreach ($attendances as $attendance) {
                        if ($attendance->status === 'finished' && $attendance->clock_in) {
                            $rule = $rules->get($attendance->shift_type);
                            if (!$rule) continue;

                            $clockInTime     = strtotime($attendance->clock_in);
                            $punctualEnd     = strtotime($rule->punctual_end);
                            $lateThreshold   = strtotime($rule->late_threshold);

                            $shiftCounts[$attendance->shift_type] = $shiftCounts[$attendance->shift_type]
                                ->map(function ($item, $key) use ($clockInTime, $punctualEnd, $lateThreshold) {
                                    if ($clockInTime <= $punctualEnd && $key === 'punctual') {
                                        return $item + 1;
                                    } elseif ($clockInTime > $lateThreshold && $key === 'late') {
                                        return $item + 1;
                                    }
                                    return $item;
                                });
                        }
                    }

                    $totalPunctualDays    = $shiftCounts->sum->get('punctual');
                    $totalLateDays        = $shiftCounts->sum->get('late');
                    $totalAttendanceDays  = $shiftCounts->sum->get('total');

                    /* 
                    * [2] HITUNG LEMBUR BERDASARKAN JAM
                    * Jika jam kerja > 8, hitung (jam kerja − 8) lalu bulatkan totalnya
                    */
                    $totalOvertimeHoursRaw = $attendances->reduce(function ($carry, $attendance) {
                        if (!$attendance->clock_in || !$attendance->clock_out) {
                            return $carry;
                        }

                        $start = strtotime($attendance->clock_in);
                        $end   = strtotime($attendance->clock_out);
                        $durationSeconds = $end - $start;
                        $durationHours   = $durationSeconds / 3600;

                        if ($durationHours > 8) {
                            return $carry + ($durationHours - 8);
                        }

                        return $carry;
                    }, 0);

                    // Bulatkan ke integer terdekat
                    $totalOvertimeHours = round($totalOvertimeHoursRaw);

                    $payrollData = array_merge($payrollData, [
                        'bonus_amount'   => $bonusPenaltySettings->bonus_amount,
                        'penalty_amount' => $bonusPenaltySettings->penalty_amount,
                    ]);

                    /* 
                    * [3] HITUNG KOMPONEN GAJI 
                    */
                    $basicSalary             = $employee->basic_salary;
                    $hourlyOvertimePay       = $employee->hourly_overtime_pay;
                    $transportationAllowance = $employee->transportation_allowance;

                    // Gaji pokok
                    $totalBasic    = ($totalAttendanceDays + $employee->paid_holidays) * $basicSalary;

                    // Nominal lembur: gunakan jam yang sudah dibulatkan
                    $totalOvertime = $totalOvertimeHours * $hourlyOvertimePay;

                    // Total bonus = hari tepat waktu * bonus per hari
                    $totalBonus    = $totalPunctualDays * $bonusPenaltySettings->bonus_amount;

                    // Total potongan = hari telat * penalty per hari
                    $totalPenalty  = $totalLateDays * $bonusPenaltySettings->penalty_amount;

                    // Gaji kotor = total pokok + lembur + tunjangan transportasi + bonus − potongan
                    $grossSalary   = $totalBasic 
                                    + $totalOvertime 
                                    + $transportationAllowance 
                                    + $totalBonus 
                                    - $totalPenalty;

                    /* 
                     * [4] HITUNG POTONGAN 
                     */
                    $deductionPercent = $employee->bpjs_health + $employee->bpjs_employment + $employee->income_tax;

                    $totalDeductions = round(($deductionPercent / 100) * $grossSalary);

                    // Gabung semua data ke array
                    $payrollData = array_merge($payrollData, [
                        // Data kehadiran
                        'total_attendance_days'   => $totalAttendanceDays,
                        'paid_holidays'           => $employee->paid_holidays,

                        // Data lembur dalam jam dan nominal
                        'total_overtime_hours'    => $totalOvertimeHours,
                        'total_overtime_pay'      => $totalOvertime,

                        // Data tepat waktu & telat
                        'total_punctual_days'     => $totalPunctualDays,
                        'total_late_days'         => $totalLateDays,

                        // Komponen pendapatan
                        'total_bonus'             => $totalBonus,
                        'total_penalty'           => $totalPenalty,
                        'basic_salary'            => $basicSalary,
                        'hourly_overtime_pay'     => $hourlyOvertimePay,
                        'transportation_allowance'=> $transportationAllowance,
                        'total_basic_salary'      => $totalBasic,
                        'gross_salary'            => $grossSalary,

                        // Data potongan
                        'bpjs_health_percent'     => $employee->bpjs_health,
                        'bpjs_employment_percent' => $employee->bpjs_employment,
                        'income_tax_percent'      => $employee->income_tax,
                        'total_deduction_percent' => $deductionPercent,
                        'total_deductions'        => $totalDeductions,

                        // Gaji bersih
                        'net_salary'              => $grossSalary - $totalDeductions,
                    ]);
                }

                // Simpan atau update data payroll
                Payroll::updateOrCreate(
                    [
                        'user_id'      => $employee->user_id,
                        'period_month' => $date->month,
                        'period_year'  => $date->year,
                    ],
                    $payrollData
                );
            }
        }
    }
}
