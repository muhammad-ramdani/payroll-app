<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
use App\Models\Shift;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    public function index()
    {
        return Inertia::render('EmployeeDataPage', ['employees' => Employee::with('user')->get()]);
    }

    protected function validationRules($forUpdate = false)
    {
        $rules = [
            'user.name' => 'required|string|max:250',
            'phone' => 'nullable|string|max:25',
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

        if(!$forUpdate) {
            $rules['id'] = 'required|uuid|unique:employees,id';
            $rules['user.username'] = 'required|string|max:250|unique:users,username';
            $rules['shift_type'] = 'required|in:Pagi,Siang';
        }

        return $rules;
    }

    public function store(Request $request)
    {
        // Validasi request terlebih dahulu
        $validated = $request->validate($this->validationRules());
        
        // Langsung pakai username dari request
        $user = User::create([
            'id' => $validated['id'],
            'name' => $validated['user']['name'],
            'username' => $validated['user']['username'], // Ambil dari frontend
            'password' => Hash::make('password'),
            'role' => 'karyawan',
        ]);
        
        // Buat employee yang terkait dengan user
        $employee = Employee::create([
            'id' => $validated['id'],
            'user_id' => $user->id,
            ...$validated
        ]);

        Shift::create([
            'user_id' => $user->id,
            'shift_type' => $validated['shift_type']
        ]);
    }
    
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate($this->validationRules(true));
        $employee->user()->update($validated['user']);
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
    }
}