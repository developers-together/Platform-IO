<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::all()->paginate(15);
        return response()->json($users);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'age' => 'nullable|integer',
            'gender' => 'nullable|string',
            'job' => 'nullable|string',
            'location' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        // Return the user and token
        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show()
    {
        $user = Auth::user();

        return response()->json($user);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {


        $validatedData = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:8',
            'age' => 'nullable|integer',
            'gender' => 'nullable|string',
            'job' => 'nullable|string',
            'location' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        if (isset($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        }

        $user->update($validatedData);

        return response()->json($user);
    }

    public function logout(Request $request)
    {
        $user = Auth::user();

        // Revoke the current access token
        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function teams()
    {
        $user = Auth::user()->load('teams');

        $teams = $user->teams->map(function ($team) {
            return [
                'id' => $team->id,
                'name' => $team->name,
                'projectname' => $team->projectname,
                'description' => $team->description,
                'code' => $team->code,
            ];
        });

        return response()->json($teams);
    }




    /**
     * Remove the specified resource from storage.
     */
    public function delete(Request $request)
    {
        $user = Auth::user();

        if ($user) {
            $user->delete();

            return response()->json([
                'message' => 'Your account has been deleted successfully.'
            ]);
        }

        return response()->json([
            'message' => 'User not authenticated.'
        ], 401);
    }
}
