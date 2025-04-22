<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): mixed
    {
        // Check if the user is authenticated and has the required role
        if ($request->user() && $request->user()->role === $role) {
            return $next($request);
        }

        // If the user is not authenticated or does not have the required role, redirect to the login page
        return redirect()->route('absensi');
    }
}
