<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::all();

        return Inertia::render('EmployeeDataPage', [
            'employees' => $employees,
        ]);
    }

    protected function validationRules()
    {
        return [
            'name' => 'required|string|min:3|max:255',
            'phone' => 'required|string|max:25',
            'address' => 'nullable|string|max:255',
            'hire_date' => 'required|date',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'account_name' => 'nullable|string|max:255',
            'basic_salary' => 'required|numeric|min:1',
            'paid_holidays' => 'required|integer|min:0|max:31',
            'daily_overtime_pay' => 'required|numeric|min:1',
            'bpjs_health' => 'required|integer|min:0|max:100',
            'bpjs_employment' => 'required|integer|min:0|max:100',
            'income_tax' => 'required|integer|min:0|max:100',
        ];
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->validationRules());
        
        $employee = Employee::create($validated);

        return $this->handleResponse($request, $employee);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate($this->validationRules());
        
        $employee->update($validated);

        return $this->handleResponse($request, $employee);
    }

    // Helper untuk handle response
    protected function handleResponse(Request $request, $employee)
    {
        if ($request->wantsJson()) {
            return response()->json($employee);
        }
        return redirect()->route('data-karyawan.index');
    }

    public function show(Employee $employee)
    {
        return response()->json($employee);
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
    }
}
