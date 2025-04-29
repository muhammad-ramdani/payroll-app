<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\EmployeeAttendance;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    public function index()
    {
        $payrolls = Payroll::with('employee')->get();

        return Inertia::render('PayrollCalculationPage', [
            'payrolls' => $payrolls,
        ]);
    }

    protected function validationRules()
    {
        return [
            'status' => 'required|in:uncalculated,unpaid,paid'
        ];
    }

    public function paid(Request $request, Payroll $payroll)
    {
        $validated = $request->validate($this->validationRules());
        
        $payroll->update($validated);

        return $this->handleResponse($request, $payroll);
    }

    public function calculate(Request $request, Payroll $payroll)
    {
        $employee = $payroll->employee;

        // Ambil data presensi
        $attendances = EmployeeAttendance::where('employee_id', $employee->id)
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
            'status' => 'unpaid'
        ]);

        return $this->handleResponse($request, $payroll);
    }

    protected function handleResponse(Request $request, $payroll)
    {
        if ($request->wantsJson()) {
            return response()->json($payroll);
        }
        
        return redirect()->route('perhitungan-penggajian.index');
    }
}
