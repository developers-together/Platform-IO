<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // public function index()
    // {
        // $users = User::paginate(15);
        // return response()->json($users);


    // }
/*
    public function login(Request $request){

        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'reqired|passeword'
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::where('email',$validated['email'])->first();

        if($user->password == $validated['password']){


        }
*/

        // return Inertia::render('auth/Login');
    // }

    /**
     * Show the form for creating a new resource.
     */
    // public function create()
    // {
    //     return Inertia::render('auth/Register');
    // }

    /**
     * Store a newly created resource in storage.
     */
/*    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            // 'age' => 'nullable|integer',
            'gender' => 'nullable|string',
            'job' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'gender' => $validatedData['gender'],
            'job' => $validatedData['job'],
            'phone' => $validatedData['phone']
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        // Return the user and token
        return Inertia::render([
            'user' => $user,
            'token' => $token,
        ]);
    }
*/
    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //$user = User::findOrFail($id);


        return Inertia::render('profile/show',[
            'user_data' => $user,
            'contacts' => $user->contacts
        ]);
    }

    public function profile(){

        $user = Auth::user();


        return Inertia::render('profile/show',[
            'user_data' => $user,
            'contacts' => $user->contacts

        ]);
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
            // 'password' => 'sometimes|string|min:8',
            // 'age' => 'nullable|integer',
            'gender' => 'nullable|string',
            'job' => 'nullable|string',
            // 'location' => 'nullable|string',
            'phone' => 'nullable|string',
            'profile' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'

        ]);

        // if (isset($validatedData['password'])) {
        //     $validatedData['password'] = Hash::make($validatedData['password']);
        // }
        if($validatedData->hasFile('profile')){
             if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $path = $validatedData->file('profile')->store('user_profiles','public');
            $validatedData['profile']= $path;
        }

        $user->update($validatedData);

        return back()->with(['success'=>'user updated sucesfully']);

        // return Inertia::render('update/{$user}',['user' => $user]);
        // return response()->json($user);
    }
/*
    public function logout(Request $request)
    {
        $user = Auth::user();

        Auth::logout();

        return Inertia::render('/user/register');


        // $request->session()->invalidate();



        // $request->session()->regenerateToken();
        // Revoke the current access token
        // $user->currentAccessToken()->delete();

        // return response()->json([
        //     'message' => 'Logged out successfully'
        // ]);
    }
*/
    public function teams()
    {
        $user = Auth::user();

        // $teams = $user->teams->map(function ($team) {
        //     return [
        //         'id' => $team->id,
        //         'name' => $team->name,
        //         'projectname' => $team->projectname,
        //         'description' => $team->description,
        //         // 'code' => $team->code,
        //     ];
        // });

        $teams = $user->teams->get();

        return Inertia::render('teams/index', ['teams'=>$teams]);
        // return response()->json($teams);
    }




    /**
     * Remove the specified resource from storage.
     */
    public function delete()
    {
        $user = Auth::user();
            /** @var \App\Models\User $user */
            $user->delete();

            return response()->json([
                'message' => 'Your account has been deleted successfully.'
            ]);

    }
}
