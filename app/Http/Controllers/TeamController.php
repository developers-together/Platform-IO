<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Team;
use App\Models\TeamUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\URL;
// use Illuminate\Http\Request;
use App\Models\Communication;


class TeamController extends Controller
{




    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // $teams = Team::with('users')->paginate(10);
        //
        // return response()->json([
        //     'message' => 'Teams retrieved successfully',
        //     'data' => $teams,
        // ]);
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
        $validated = $request->validate([
        'name'=>'string|required|max:255',
        'projectname'=>'string|required|max:255',
        'description'=>'string|nullable',
        'contacts'=>'array'
        // 'code' => 'required|string|size:6|unique:teams,code'
        ]);

        // Get the authenticated user
        // $user = $request->user();

        $userId = Auth::id();

        $team = Team::create([
        'name'=> $validated['name'],
        'projectname' =>$validated['projectname'],
        'description'=>$validated['description'] ?? null,
        // 'code' => $validated['code']

        ]);

        foreach($validated['contacts'] as $contact){
        Communication::create([
            'team_id' => $team->id,
            'contact' => $contact
        ]);
        }

        // Storage::makeDirectory('public/teams/'.$team->id);

        $team->users()->attach($userId, ['role' => 'admin']);


        return Inertia::render("/team/{$team->id}",[
            'team' => $team
        ]);

    }


    /**
     * Display the specified resource.
     */
    public function show(Team $team)
    {
        // Load the team with its related users
        // $team->load('users');
        //
        // $team = Team::firstOrFail($teamId);

        return Inertia::render('team/{$team->id}',['team'=>$team,'users'=>$team->users]);
        // Return the team details as a JSON response
        // return response()->json([
        //     'message' => 'Team retrieved successfully',
        //     'data' => $team,
        // ]);

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Team $team)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Team $team)
    {

        // Authorize the action (ensure the user can update the team)
        Gate::authorize('update', $team);

        // Validate the request data
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'projectname' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
        ]);

        // Update the team details
        $team->update($validated);

        // Return the updated team as a JSON response
        return response()->json([
            'message' => 'Team updated successfully',
            'data' => $team->load('users'), // Load related users
        ], 200);


    }


    public function addMembers(Request $request, Team $team)
    {
        // Authorize the action (ensure the user can update the team)
        Gate::authorize('update', $team);

        // Validate the request data
        $validated = $request->validate([
            'users' => 'required|array', // Array of user objects
            'users.*.id' => 'required|exists:users,id', // Ensure each user ID exists
            'users.*.role' => 'sometimes|in:member,viewer', // Validate the role
        ]);

        // Attach the users to the team with the specified role (default: viewer)
        foreach ($validated['users'] as $userData) {
            $role = $userData['role'] ?? 'member'; // Default role is 'viewer'

            if ($role === 'admin') {
                return response()->json([
                    'message' => 'The admin role cannot be assigned through this function.',
                ], 403);
            }

            // Attach the user with the specified role
            $team->users()->syncWithoutDetaching([
                $userData['id'] => ['role' => $role],
            ]);
        }

        // Return the updated team with the associated users
        return response()->json($team->fresh()->load('users'), 200);
    }

    public function removeMembers(Request $request, Team $team)
    {
        // Authorize the action (ensure the user can update the team)
        Gate::authorize('update', $team);

        // Validate the request data
        $validated = $request->validate([
            'user_id' => 'exists|users', // Array of user IDs to remove
        ]);

        // Ensure the users to be removed are part of the team
        // $usersInTeam = $team->users()->whereIn('user_id', $validated['user_ids'])->pluck('user_id');

        $user = $team->users->where('id','user_id')->first();
        if($user->role == 'admin'){
            // return Inertia::render('teams/{$team}/removeMember',['status','500']);
            return back()->with([
                'error' =>'Cannot remove the admin',
            ]);
        }

        if ($user->isEmpty()) {
            // return response()->json([
            //     'message' => 'No valid users to remove from the team.',
            // ], 404);
            return back()->with([
                'error' => 'no valid user to remove'
            ]);
        }

        // Remove the users from the team
        $team->users()->detach($user);

        // Return the updated team as a JSON response
        // return response()->json([
        //     'message' => 'Members removed successfully',
        //     'data' => $team->load('users'), // Load related users
        // ], 200);
        return Inertia::render('/teams/{$team}');
    }

    public function changeRoles(Request $request, Team $team)
    {
        // Authorize the action (ensure the user can update the team)
        Gate::authorize('update', $team);

        // Validate the request data
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id', // User ID to update
            'role' => 'required|in:member,viewer', // New role (cannot be 'admin')
        ]);

        // Ensure the user is part of the team
        if (!$team->users()->where('user_id', $validated['user_id'])->exists()) {
            return response()->json([
                'message' => 'The user is not part of this team.',
            ], 404);
        }

        // Update the user's role in the team
        $team->users()->updateExistingPivot($validated['user_id'], [
            'role' => $validated['role'],
        ]);

        // Return the updated team as a JSON response
        return response()->json([
            'message' => 'User role updated successfully',
            'data' => $team->load('users'), // Load related users
        ], 200);
    }

    public function leaveTeam(Team $team)
    {
        $user = Auth::user();

        // Check if user is part of the team
        $userInTeam = $team->users()->where('user_id', $user->id)->first();

        if (!$userInTeam) {
            return response()->json([
                'message' => 'The user is not part of this team.',
            ], 404);
        }

        // Get the user's role
        $role = $userInTeam->pivot->role;

        if ($role === 'admin') {
            // Try to find another member or viewer to promote
            $newAdmin = $team->users()
                ->where('user_id', '!=', $user->id)
                ->whereIn('role', ['member', 'viewer'])
                ->first();

            if (!$newAdmin) {
                return response()->json([
                    'message' => 'You are the only member in the team. Cannot leave without assigning a new admin.',
                ], 403);
            }

            $team->users()->updateExistingPivot($newAdmin->id, ['role' => 'admin']);
        }

        $team->users()->detach($user->id);

        return response()->json([
            'message' => 'You have left the team successfully.',
        ], 200);
    }


    public function changeAdmin(Request $request, Team $team)
    {
        // Authorize the action (ensure the user can update the team)
        Gate::authorize('update', $team);

        // Validate the request data
        $validated = $request->validate([
            'id' => 'required|exists:users,id', // New admin's user ID
        ]);

        // Ensure the new admin is part of the team
        if (!$team->users()->where('user_id', $validated['id'])->exists()) {
            return response()->json([
                'message' => 'The new admin is not part of this team.',
            ], 404);
        }

        $currentAdmin = $team->users()->wherePivot('role', 'admin')->first();

        if ($currentAdmin) {
            $team->users()->updateExistingPivot($currentAdmin->id, [
                'role' => 'member',
            ]);
        }

        $team->users()->updateExistingPivot($validated['id'], [
            'role' => 'admin',
        ]);

        // Return the updated team as a JSON response
        return response()->json([
            'message' => 'admin changed successfully',
            'data' => $team->load('users'), // Load related users
        ], 200);
    }

    public function generateURL(Team $team){

        Gate::authorize('update',$team);
        $url = URL::signedRoute('joinTeam',['teamId'=> $team->id]);

        return Inertia::render('team/{team}/joinLink',['url'=>$url]);
    }

    public function joinTeam(Team $team, Request $request)
    {
        // $request->validate([
        //     'url' => 'required|url'
        // ]);
        if (! $request->hasValidSignature()) {
                abort(401);
        }

        $user = Auth::user();
        $team->users()->attach($user->id);
        // if(! $request->hasValidSignature()){
        //     abort(401);
        // }
        // Find team by code
        // $team = Team::where('code', $request->code)->first();

        // if (!$team) {
            // return response()->json([
                // 'message' => 'Invalid team code.'
            // ], 404);
        // }

        // Check if user is already part of the team
        // if ($team->users()->where('user_id', $user->id)->exists()) {
        //     return response()->json([
        //         'message' => 'You are already a member of this team.'
        //     ], 200);
        // }
        //
        // // Attach user to the team
        // $team->users()->attach($user->id);
        //
        // return response()->json([
        //     'message' => 'Joined team successfully.',
        //     'team' => $team
        // ], 200);
    }

    public function getTeamById($id)
    {
        $team = Team::with('users')->find($id);

        if (!$team) {
            return response()->json([
                'message' => 'Team not found',
            ], 404);
        }

        return response()->json([
            'message' => 'Team retrieved successfully',
            'data' => $team
        ]);
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Team $team)
    {
        Gate::authorize('delete', $team);

        try {

            $team->delete();

            return response()->json([
                'message' => 'Team deleted successfully',
                'data' => [
                    'deleted_team_id' => $team->id,
                    'deleted_at' => now()->toDateTimeString()
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete team',
                'error' => $e->getMessage(),
                'team_id' => $team->id
            ], 500);
        }
    }
}
