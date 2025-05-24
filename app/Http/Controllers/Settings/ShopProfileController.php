<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\ShopProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopProfileController extends Controller
{
    public function edit()
    {
        return Inertia::render('settings/ShopProfile', [
            'shopProfile' => ShopProfile::first()
        ]);
    }

    public function update(Request $request)
    {
        ShopProfile::where('id', 1)->update($request->validate([
            'shop_name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
        ]));
    }
}
