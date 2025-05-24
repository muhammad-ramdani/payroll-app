<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PersonalDataController extends Controller
{
    public function edit()
    {
        return Inertia::render('settings/PersonalData', [
            'employee' => auth()->user()->employee
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'nullable|string|max:25',
            'address' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:50',
            'account_number' => 'nullable|string|max:100',
            'account_name' => 'nullable|string|max:255',
        ]);

        auth()->user()->employee->update($validated);
    }
}
