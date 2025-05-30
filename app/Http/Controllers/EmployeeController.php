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
            'hire_date' => 'required|date',
            'basic_salary' => 'required|numeric',
            'paid_holidays' => 'required|integer|max:31',
            'daily_overtime_pay' => 'required|numeric',
            'bpjs_health' => 'required|integer|max:100',
            'bpjs_employment' => 'required|integer|max:100',
            'income_tax' => 'required|integer|max:100',
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
            'username' => $validated['user']['username'],
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