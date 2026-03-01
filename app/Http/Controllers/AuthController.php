<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
     // Handle user login
     public function login(Request $request)
     {
         $credentials = $request->validate([
             'email' => 'required|email',
             'password' => 'required',
         ]);
 
         if (Auth::attempt($credentials)) {
             $user = Auth::user();
             
             $token = $user->createToken('auth-token')->plainTextToken;
 
             return response()->json([
                 'message' => 'Login successful',
                 'user' => $user,
                 'token' => $token,
             ]);
         }
 
         return response()->json(['message' => 'Invalid credentials'], 401);
     }
}
