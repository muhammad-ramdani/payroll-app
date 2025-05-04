<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): mixed
    {
        // Cek apakah user terautentikasi dan memiliki role yang sesuai
        if ($request->user() && $request->user()->role === $role) {
            return $next($request);
        }

        // Jika user tidak terautentikasi, redirect ke absensi
        // if (!$request->user()) {
        //     return redirect()->route('absensi');
        // }

        // Jika user terautentikasi tapi role tidak sesuai
        if ($request->user()->role === 'admin') {
            // Admin yang mencoba akses role lain redirect ke dashboard
            return redirect()->route('dashboard');
        } else {
            // Karyawan yang mencoba akses role admin redirect ke absensi
            return redirect()->route('absensi');
        }
    }
}