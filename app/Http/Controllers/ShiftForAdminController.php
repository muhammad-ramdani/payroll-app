<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Shift;
use App\Models\User;

class ShiftForAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('ShiftForAdminPage', [
            'shifts' => Shift::with('user')->orderBy('shift_type', 'asc')->orderBy(User::select('name')->whereColumn('users.id', 'shifts.user_id'), 'asc')->get(),
        ]);
    }

    public function update(Request $request, string $userId)
    {
        Shift::where('user_id', $userId)->firstOrFail()->update(
            $request->validate(['shift_type' => 'required|in:Pagi,Siang'])
        );
    }
}