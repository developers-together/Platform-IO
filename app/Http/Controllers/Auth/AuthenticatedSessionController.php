<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;



class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        // Authenticate the user
        $request->authenticate();

        // Get the authenticated user
        $user = auth()->user();

        // Generate an API token (if using Laravel Sanctum)
        $token = $user->createToken('auth_token')->plainTextToken;

        // Return JSON response with user info and token
        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ], 200);
    }


    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): JsonResponse
    {
    $user = Auth::user();

    if ($user) {
        // Revoke all tokens of the authenticated user
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'User delete successfully'
        ]);
    }

    return response()->json([
        'success' => false,
        'message' => 'User not authenticated'
    ], 401);
    }

}
