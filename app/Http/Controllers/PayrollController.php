<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\User;
use App\Models\Attendance;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function index()
    {
        $payrolls = Payroll::with('user')->orderBy(User::select('name')->whereColumn('users.id', 'payrolls.user_id'), 'asc')->get();

        return Inertia::render('PayrollCalculationPage', [
            'payrolls' => $payrolls,
        ]);
    }

    public function report()
    {
        $payrolls = Payroll::get();

        return Inertia::render('PayrollReportPage', [
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
            ->where('status', 'finished')
            ->whereMonth('date', $payroll->period_month)
            ->whereYear('date', $payroll->period_year)
            ->get();

        // Hitung hari hadir
        $totalAttendanceDays = $attendances->count();

        // Hitung hari lembur (>8.5 jam kerja)
        $totalOvertimeDays = $attendances->filter(function($att) {
            // Lewat jika clock_in atau clock_out kosong
            if (! $att->clock_in || ! $att->clock_out) {
                return false;
            }

            // Buat DateTime berdasarkan tanggal + jam
            $start = new \DateTime($att->date . ' ' . $att->clock_in);
            $end   = new \DateTime($att->date . ' ' . $att->clock_out);

            // Hitung selisih dalam detik, lalu konversi ke jam
            $diffSeconds = $end->getTimestamp() - $start->getTimestamp();
            $hoursWorked = $diffSeconds / 3600;

            // Kategori lembur: lebih dari 8.5 jam
            return $hoursWorked > 8.5;
        })->count();


        // Ambil data komponen gaji
        $basicSalary = $employee->basic_salary;
        $paidHolidays = $employee->paid_holidays;
        $dailyOvertimePay = $employee->daily_overtime_pay;

        // Hitung komponen penghasilan
        $totalBasicSalary = ($totalAttendanceDays + $paidHolidays) * $basicSalary;
        $totalOvertimePay = $totalOvertimeDays * $dailyOvertimePay;
        $grossSalary = $totalBasicSalary + $totalOvertimePay;

        // Hitung total potongan persen (BPJS + BPJKT + PPh)
        $totalDeductionPercent = $employee->bpjs_health + $employee->bpjs_employment + $employee->income_tax;

        // Hitung potongan
        $totalDeductions = round(($totalDeductionPercent / 100) * $grossSalary);

        // Hitung gaji bersih
        $netSalary = $grossSalary - $totalDeductions;

         // Update payroll
        $payroll->update([
            'total_attendance_days' => $totalAttendanceDays,
            'paid_holidays' => $paidHolidays,
            'total_overtime_days' => $totalOvertimeDays,
            'basic_salary' => $basicSalary,
            'daily_overtime_pay' => $dailyOvertimePay,
            'total_basic_salary' => $totalBasicSalary,
            'total_overtime_pay' => $totalOvertimePay,
            'gross_salary' => $grossSalary,
            'bpjs_health_percent' => $employee->bpjs_health,
            'bpjs_employment_percent' => $employee->bpjs_employment,
            'income_tax_percent' => $employee->income_tax,
            'total_deduction_percent' => $totalDeductionPercent,
            'total_deductions' => $totalDeductions,
            'net_salary' => $netSalary,
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
