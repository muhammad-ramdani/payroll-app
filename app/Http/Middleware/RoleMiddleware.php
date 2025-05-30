<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): mixed
    {
        if ($request->user() && $request->user()->role === $role) {
            return $next($request);
        }

        if ($request->user()->role === 'admin') {
            return redirect()->route('dashboard');
        } else {
            return redirect()->route('presensi');
        }
    }
}