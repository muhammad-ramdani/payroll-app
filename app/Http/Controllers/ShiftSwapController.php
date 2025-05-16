<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ShiftSwap;
use App\Models\Shift;
use App\Models\User;
use Inertia\Inertia;

class ShiftSwapController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return Inertia::render('ShiftSwapPage', [
            'userShifts'            => $user->shifts()->with('user')->get(),
            'otherShifts'           => Shift::with('user')->where('user_id', '!=', $user->id)->orderBy('shift_type', 'asc')->orderBy(User::select('name')->whereColumn('users.id', 'shifts.user_id'), 'asc')->get(),
            'receivedRequests'      => ShiftSwap::with(['requesterShift.user', 'targetShift.user', 'requester'])->where('target_user_id', $user->id)->get(),
            'sentRequests'          => ShiftSwap::where('requester_id', $user->id)->where('status', 'pending')->get(),
            'globalPendingShiftIds' => ShiftSwap::where('status', 'pending')->get(['requester_shift_id', 'target_shift_id'])->flatMap(fn($swap) => [$swap->requester_shift_id, $swap->target_shift_id])->unique()->values()->toArray(),
        ]);
    }

    public function approveSwap(Request $request, $id)
    {
        $swapRequest = ShiftSwap::findOrFail($id);
        
        if ($swapRequest->target_user_id !== auth()->id()) {
            abort(403);
        }

        // Lakukan pertukaran
        $requesterShift = Shift::findOrFail($swapRequest->requester_shift_id);
        $targetShift = Shift::findOrFail($swapRequest->target_shift_id);

        // Tukar user_id
        $temp = $requesterShift->user_id;
        $requesterShift->user_id = $targetShift->user_id;
        $targetShift->user_id = $temp;

        $requesterShift->save();
        $targetShift->save();

        // Hapus request setelah pertukaran berhasil
        $swapRequest->delete();

        return back();
    }

    public function rejectSwap(Request $request, $id)
    {
        $swapRequest = ShiftSwap::findOrFail($id);
        
        if ($swapRequest->target_user_id !== auth()->id()) {
            abort(403);
        }

        $swapRequest->delete();

        return back();
    }
}
