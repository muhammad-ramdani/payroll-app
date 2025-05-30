<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\Attendance;
use App\Models\AttendanceRuleSetting;
use App\Models\AttendanceBonusPenaltySetting;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use DateTime;

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
                    'user_id' => $employee->user_id,
                    'period_month' => $date->month,
                    'period_year' => $date->year,
                    'salary_status' => $isLastMonth ? 'uncalculated' : 'paid_cash', // Status bulan terakhir
                    'confirmation_status' => $confirmationStatus,
                ];

                // Hanya hitung untuk bulan yang sudah lewat (bukan bulan ini)
                if (!$isLastMonth) {
                    // Ambil data presensi bulan tersebut
                    $attendances = Attendance::where('user_id', $employee->user_id)->whereMonth('date', $date->month)->whereYear('date', $date->year)->get();

                    /* 
                     * [1] HITUNG KETEPATAN WAKTU & KETERLAMBATAN
                     * Kelompokkan presensi berdasarkan shift_type dan hitung per shift
                     */
                    $shiftCounts = $attendances->groupBy('shift_type')->map(function ($group) {
                        return collect([
                            'punctual' => 0,   // Hari tepat waktu
                            'late' => 0,        // Hari telat
                            'total' => $group->where('status', 'finished')->count() // Total hari kerja
                        ]);
                    });

                    // Ambil semua aturan shift dari database
                    $rules = AttendanceRuleSetting::with('attendanceBonusPenaltySetting')->get()->keyBy('shift_type');

                    // Proses setiap presensi
                    foreach ($attendances as $attendance) {
                        // Hanya proses presensi yang completed
                        if ($attendance->status === 'finished' && $attendance->clock_in) {
                            // Ambil aturan untuk shift_type ini
                            $rule = $rules->get($attendance->shift_type);
                            if (!$rule) continue; // Skip jika tidak ada aturan

                            // Konversi waktu ke timestamp
                            $clockInTime = strtotime($attendance->clock_in);
                            $punctualEnd = strtotime($rule->punctual_end);
                            $lateThreshold = strtotime($rule->late_threshold);

                            // Logika pengecekan
                            $shiftCounts[$attendance->shift_type] = $shiftCounts[$attendance->shift_type]->map(function ($item, $key) use ($clockInTime, $punctualEnd, $lateThreshold) {
                                if ($clockInTime <= $punctualEnd && $key === 'punctual') { // Tepat waktu
                                    return $item + 1;
                                } elseif ($clockInTime > $lateThreshold && $key === 'late') { // Telat
                                    return $item + 1;
                                }
                                return $item;
                            });
                        }
                    }

                    // Total semua shift
                    $totalPunctualDays = $shiftCounts->sum->get('punctual');
                    $totalLateDays = $shiftCounts->sum->get('late');
                    $totalAttendanceDays = $shiftCounts->sum->get('total');

                    /* 
                     * [2] HITUNG LEMBUR 
                     * Menggunakan perhitungan timestamp langsung tanpa Carbon
                     */
                    $totalOvertimeDays = $attendances->filter(function ($attendance) {
                        // Skip jika tidak ada jam masuk/keluar
                        if (!$attendance->clock_in || !$attendance->clock_out) return false;
                        
                        // Hitung durasi kerja dalam detik
                        $start = strtotime($attendance->clock_in);
                        $end = strtotime($attendance->clock_out);
                        $duration = $end - $start;
                        
                        // 8.5 jam = 30600 detik (8.5 * 3600)
                        return $duration > 30600;
                    })->count();

                    $payrollData = array_merge($payrollData, [
                        'bonus_amount' => $bonusPenaltySettings->bonus_amount, // Ambil dari setting
                        'penalty_amount' => $bonusPenaltySettings->penalty_amount, // Ambil dari setting
                    ]);

                    /* 
                     * [3] HITUNG KOMPONEN GAJI 
                     */
                    // Gaji pokok
                    $basicSalary = $employee->basic_salary;
                    // Upah lembur per hari
                    $overtimePay = $employee->daily_overtime_pay;
                    // Total tunjangan transportasi
                    $transportationAllowance = $employee->transportation_allowance;
                    
                    // Total gaji pokok = (hari kerja + libur berbayar) * gaji pokok
                    $totalBasic = ($totalAttendanceDays + $employee->paid_holidays) * $basicSalary;
                    
                    // Total lembur = hari lembur * upah lembur
                    $totalOvertime = $totalOvertimeDays * $overtimePay;
                    
                    // Total bonus = hari tepat waktu * bonus per hari
                    $totalBonus = $totalPunctualDays * $bonusPenaltySettings->bonus_amount;
                    
                    // Total potongan = hari telat * penalty per hari
                    $totalPenalty = $totalLateDays * $bonusPenaltySettings->penalty_amount;
                    
                    // Gaji kotor = total pokok + lembur + bonus - potongan
                    $grossSalary = $totalBasic + $totalOvertime + $transportationAllowance + $totalBonus - $totalPenalty;
                    
                    /* 
                     * [4] HITUNG POTONGAN 
                     */
                    // Total persentase potongan
                    $deductionPercent = $employee->bpjs_health + $employee->bpjs_employment + $employee->income_tax;

                    // Nominal potongan
                    $totalDeductions = round(($deductionPercent / 100) * $grossSalary);
                    
                    // Gabungkan semua data ke array
                    $payrollData = array_merge($payrollData, [
                        // Data kehadiran
                        'total_attendance_days' => $totalAttendanceDays,
                        'paid_holidays' => $employee->paid_holidays,
                        
                        // Data lembur
                        'total_overtime_days' => $totalOvertimeDays,
                        
                        // Data tepat waktu
                        'total_punctual_days' => $totalPunctualDays,
                        'total_late_days' => $totalLateDays,
                        
                        // Komponen penghasilan
                        'total_bonus' => $totalBonus,
                        'total_penalty' => $totalPenalty,
                        'basic_salary' => $basicSalary,
                        'daily_overtime_pay' => $overtimePay,
                        'transportation_allowance' => $transportationAllowance,
                        'total_basic_salary' => $totalBasic,
                        'total_overtime_pay' => $totalOvertime,
                        'gross_salary' => $grossSalary,
                        
                        // Data potongan
                        'bpjs_health_percent' => $employee->bpjs_health,
                        'bpjs_employment_percent' => $employee->bpjs_employment,
                        'income_tax_percent' => $employee->income_tax,
                        'total_deduction_percent' => $deductionPercent,
                        'total_deductions' => $totalDeductions,
                        
                        // Gaji bersih
                        'net_salary' => $grossSalary - $totalDeductions
                    ]);
                }

                // Simpan atau update data payroll
                Payroll::updateOrCreate(
                    [
                        // Cari berdasarkan kombinasi unik
                        'user_id' => $employee->user_id,
                        'period_month' => $date->month,
                        'period_year' => $date->year
                    ],
                    $payrollData // Data yang akan diupdate/dicreate
                );
            }
        }
    }
}