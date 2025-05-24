<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Shift;
use App\Models\User;
use App\Models\ShiftSwap;

class ShiftForEmployeeController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return Inertia::render('ShiftForEmployeePage', [
            'userShifts'            => $user->shifts()->with('user')->get(),
            'otherShifts'           => Shift::with('user')->where('user_id', '!=', $user->id)->orderBy('shift_type', 'asc')->orderBy(User::select('name')->whereColumn('users.id', 'shifts.user_id'), 'asc')->get(),
            'sentRequests'          => ShiftSwap::where('requester_id', $user->id)->where('status', 'pending')->get(),
            'globalPendingShiftIds' => ShiftSwap::where('status', 'pending')->get(['requester_shift_id', 'target_shift_id'])->flatMap(fn($swap) => [$swap->requester_shift_id, $swap->target_shift_id])->unique()->values()->toArray(),
        ]);
    }

    public function requestSwap(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'shift_id' => 'required|exists:shifts,id'
        ]);

        $targetShift = Shift::findOrFail($request->shift_id);
        $userShift = $user->shifts()->firstOrFail();

        ShiftSwap::create([
            'requester_id' => $user->id,
            'target_user_id' => $targetShift->user_id,
            'requester_shift_id' => $userShift->id,
            'target_shift_id' => $targetShift->id,
            'status' => 'pending'
        ]);
    }
}