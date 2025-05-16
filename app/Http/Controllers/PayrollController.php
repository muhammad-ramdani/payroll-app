<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\User;
use App\Models\Attendance;
use App\Models\AttendanceRuleSetting;
use App\Models\AttendanceBonusPenaltySetting;
use App\Models\ShopProfile;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class PayrollController extends Controller
{
    public function index()
    {
        $payrolls = Payroll::with('user', 'attendancerulesetting')->orderBy(User::select('name')->whereColumn('users.id', 'payrolls.user_id'), 'asc')->get();

        return Inertia::render('PayrollCalculationPage', [
            'payrolls' => $payrolls,
        ]);
    }
    
    public function employee()
    {
        $payrolls = Payroll::with('user')->where('user_id', auth()->id())->orderBy('period_month', 'desc')->get();

        return Inertia::render('PayrollPage', [
            'payrolls' => $payrolls,
        ]);
    }

    public function generatePDF($id)
    {
        $payroll = Payroll::with('user.employee')->findOrFail($id);

        $shopProfile = ShopProfile::first();

        $admin = User::where('role', 'admin')->first();

        $pdf = PDF::loadView('pdf.payroll', compact('payroll', 'shopProfile', 'admin'))->setPaper('a4', 'portrait');

        $monthName = Carbon::create()->month($payroll->period_month)->translatedFormat('F');

        $filename = "Slip Gaji-{$payroll->user->name}-{$monthName} {$payroll->period_year}.pdf";

        return $pdf->stream($filename);
    }

    public function report()
    {
        $payrolls = Payroll::get();

        return Inertia::render('PayrollReportPage', [
            'payrolls' => $payrolls,
        ]);
    }

    protected function validationRulesAdmin()
    {
        return [
            'salary_status' => 'required|in:uncalculated,unpaid,paid_transfer,paid_cash',
            'confirmation_status' => 'required|in:blank,pending_confirmation,received'
        ];
    }

    protected function validationRulesEmployee()
    {
        return [
            'confirmation_status' => 'required|in:blank,pending_confirmation,received'
        ];
    }

    public function paid(Request $request, Payroll $payroll)
    {
        $validated = $request->validate($this->validationRulesAdmin());
        
        $payroll->update($validated);

        return $this->handleResponseAdmin($request, $payroll);
    }

    public function confirmation(Request $request, Payroll $payroll)
    {
        $validated = $request->validate($this->validationRulesEmployee());
        
        $payroll->update($validated);

        return $this->handleResponseEmployee($request, $payroll);
    }

    public function calculate(Request $request, Payroll $payroll)
    {
        $employee = $payroll->user->employee;

        // Ambil data presensi
        $attendances = Attendance::where('user_id', $payroll->user_id)
            ->whereMonth('date', $payroll->period_month)
            ->whereYear('date', $payroll->period_year)
            ->get();

        // Ambil setting bonus/penalty global
        $bonusPenalty = AttendanceBonusPenaltySetting::first();
        
        // Validasi jika setting tidak ditemukan
        if (!$bonusPenalty) {
            abort(500, 'Bonus/Penalty settings not configured');
        }

        // Ambil semua aturan shift dari database
        $rules = AttendanceRuleSetting::all()->keyBy('shift_type');

        // Inisialisasi counter
        $counters = [
            'total_attendance' => 0,
            'total_overtime' => 0,
            'total_punctual' => 0,
            'total_late' => 0,
        ];

        foreach ($attendances as $att) {
            if ($att->status !== 'finished') continue;

            // Hitung hari kerja
            $counters['total_attendance']++;

            // Hitung lembur menggunakan timestamp PHP native
            if ($att->clock_in && $att->clock_out) {
                $start = strtotime($att->clock_in);
                $end = strtotime($att->clock_out);
                if (($end - $start) > (8.5 * 3600)) { // 8.5 jam dalam detik
                    $counters['total_overtime']++;
                }
            }

            // Hitung ketepatan waktu berdasarkan shift_type di attendance
            if ($att->shift_type && $att->clock_in) {
                $rule = $rules->get($att->shift_type);
                
                if ($rule) {
                    $clockIn = strtotime($att->clock_in);
                    $punctualEnd = strtotime($rule->punctual_end);
                    $lateThreshold = strtotime($rule->late_threshold);

                    if ($clockIn <= $punctualEnd) {
                        $counters['total_punctual']++;
                    } elseif ($clockIn > $lateThreshold) {
                        $counters['total_late']++;
                    }
                }
            }
        }

        // Hitung komponen gaji
        $grossSalary = (
            (($counters['total_attendance'] + $employee->paid_holidays) * $employee->basic_salary) + // Gaji pokok
            ($counters['total_overtime'] * $employee->daily_overtime_pay) +                         // Lembur
            ($counters['total_punctual'] * $bonusPenalty->bonus_amount) -                          // Bonus
            ($counters['total_late'] * $bonusPenalty->penalty_amount)                              // Potongan
        );

        // Hitung potongan
        $totalDeductionPercent = $employee->bpjs_health + $employee->bpjs_employment + $employee->income_tax;
        $totalDeductions = round(($totalDeductionPercent / 100) * $grossSalary);

        // Update payroll dengan data baru
        $payroll->update([
            'total_attendance_days' => $counters['total_attendance'],
            'paid_holidays' => $employee->paid_holidays,
            'total_overtime_days' => $counters['total_overtime'],
            'total_punctual_days' => $counters['total_punctual'],
            'total_late_days' => $counters['total_late'],
            'bonus_amount' => $bonusPenalty->bonus_amount,         // Nilai per hari
            'penalty_amount' => $bonusPenalty->penalty_amount,     // Nilai per hari
            'total_bonus' => $counters['total_punctual'] * $bonusPenalty->bonus_amount,
            'total_penalty' => $counters['total_late'] * $bonusPenalty->penalty_amount,
            'basic_salary' => $employee->basic_salary,
            'daily_overtime_pay' => $employee->daily_overtime_pay,
            'total_basic_salary' => ($counters['total_attendance'] + $employee->paid_holidays) * $employee->basic_salary,
            'total_overtime_pay' => $counters['total_overtime'] * $employee->daily_overtime_pay,
            'gross_salary' => $grossSalary,
            'bpjs_health_percent' => $employee->bpjs_health,
            'bpjs_employment_percent' => $employee->bpjs_employment,
            'income_tax_percent' => $employee->income_tax,
            'total_deduction_percent' => $totalDeductionPercent,
            'total_deductions' => $totalDeductions,
            'net_salary' => $grossSalary - $totalDeductions,
            'salary_status' => 'unpaid'
        ]);

        return $this->handleResponseAdmin($request, $payroll);
    }

    protected function handleResponseAdmin(Request $request, $payroll)
    {
        if ($request->wantsJson()) {
            return response()->json($payroll);
        }
        
        return redirect()->route('perhitungan-penggajian');
    }

    protected function handleResponseEmployee(Request $request, $payroll)
    {
        if ($request->wantsJson()) {
            return response()->json($payroll);
        }
        
        return redirect()->route('penggajian');
    }
}
