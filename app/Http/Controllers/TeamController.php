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

        $team->users()->attach($userId, ['role' => 'owner']);


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

        Gate::authorize('view',Auth::user(),$team);
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


    public function addMember(Request $request, Team $team)
    {
        // Authorize the action (ensure the user can update the team)
        Gate::authorize('addMember', $team);

        // Validate the request data
        $validated = $request->validate([
            'id' => 'required|exists:user', // Array of user objects
            'role' => 'sometimes|in:member,viewer,admin', // Validate the role
        ]);

        // Attach the users to the team with the specified role (default: viewer)
        foreach ($validated['users'] as $userData) {
            $role = $userData['role'] ?? 'member'; // Default role is 'viewer'

            if ($role === 'owner') {
                return response()->json([
                    'message' => 'The owner role cannot be assigned through this function.',
                ], 403);
            }

            // Attach the user with the specified role
            $team->users()->syncWithoutDetaching([
                $userData['id'] => ['role' => $role],
            ]);
        }

        return back()->with(['success' => 'user added successfully']);
        // return response()->json($team->fresh()->load('users'), 200);
    }

    public function removeMember(Request $request, Team $team)
    {
        $user = Auth::user();
        // Authorize the action (ensure the user can update the team)
        Gate::authorize('removeMember',$user, $team);

        // Validate the request data
        $validated = $request->validate([
            'user_id' => 'exists|users', // Array of user IDs to remove
        ]);

        // Ensure the users to be removed are part of the team
        // $usersInTeam = $team->users()->whereIn('user_id', $validated['user_ids'])->pluck('user_id');

        $user = $team->users->where('id','user_id')->first();
        if($user->role == 'owner'){
            // return Inertia::render('teams/{$team}/removeMember',['status','500']);
            return back()->with([
                'error' =>'Cannot remove the owner',
            ]);
        }

        $user = $team->users->where('id','user_id')->first();


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
        // return Inertia::render('/teams/{$team}');
        return back()->with(['success'=>'member removed']);
    }

    public function changeRole(Request $request, Team $team)
    {

        $user = Auth::user();
        // Authorize the action (ensure the user can update the team)
        Gate::authorize('changeRole',$user, $team);

        // Validate the request data
        $validated = $request->validate([
            'user_id' => 'required|exists:user', // User ID to update
            'role' => 'required|in:member,viewer,admin', // New role (cannot be 'admin')
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

    public function transferOwner(Team $team, Request $request){

        $user = Auth::user();

        Gate::authorize('transferOwner', $user,$team);
        $validated = $request->validate([
        'id' => 'required|exists:user'
        ]);

        $team->users()->where('user_id',$validated['id'])->updateExistingPivot('role','owner');
        $team->users()->where('user_id',$user->id)->delete();

        return redirect('/');

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

        if ($role === 'owner') {

            return back()->with([
                'error' => 'please transfer ownership'
            ]);
        }

        $team->users()->detach($user->id);


    }

    public function generateURL(Team $team){

        $user = Auth::user();
        Gate::authorize('generateURL',$user,$team);
        $url = URL::signedRoute('joinTeam',['teamId'=> $team->id]);

        return Inertia::render('team/{team}/joinLink',['url'=>$url]);
    }

    public function joinTeam(Team $team, Request $request)
    {
        if (! $request->hasValidSignature()) {
                abort(401);
        }

        $user = Auth::user();
        $team->users()->attach($user->id);
    }

    public function getTeamById($id)
    {
        $team = Team::with('users')->find($id);

        Gate::authorize('getTeamById',Auth::user(),$team);

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
