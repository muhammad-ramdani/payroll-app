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

        return Inertia::render('data-karyawan', [
            'employees' => $employees,
        ]);
    }

    public function create()
    {
        return view('employees.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'hire_date' => 'required|date',
            'basic_salary' => 'required|numeric',
        ]);

        Employee::create($validated);

        return redirect()->route('employees.index')->with('success', 'Employee created successfully.');
    }

    public function show(Employee $employee)
    {
        return view('employees.show', compact('employee'));
    }

    public function edit(Employee $employee)
    {
        return view('employees.edit', compact('employee'));
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'hire_date' => 'required|date',
            'basic_salary' => 'required|numeric',
        ]);

        $employee->update($validated);

        return redirect()->route('employees.index')->with('success', 'Employee updated successfully.');
    }

    public function destroy(Employee $employee)
    {
        try {
            // Periksa apakah data sudah dihapus (soft delete)
            if ($employee->trashed()) {
                return response()->json(['error' => 'Employee already deleted.'], 400);
            }

            // Hapus data
            $employee->delete();

            return response()->json(['success' => 'Employee deleted successfully.']);
        } catch (\Exception $e) {
            // Log error untuk debugging
            \Log::error('Error deleting employee: ' . $e->getMessage());

            return response()->json(['error' => 'Failed to delete employee.'], 500);
        }
    }
}
