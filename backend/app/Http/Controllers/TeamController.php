<?php

namespace App\Http\Controllers;


use App\Models\Team;
use App\Models\TeamUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;

class TeamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Paginate teams (10 per page)
        $teams = Team::with('users')->paginate(10);

        // Return the paginated list of teams as a JSON response
        return response()->json([
            'message' => 'Teams retrieved successfully',
            'data' => $teams,
        ]);
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

        ]);

        // Get the authenticated user
        $user = $request->user();

        $userId = $user->id;

        $team = Team::create([
        'name'=> $validated['name'],
        'projectname' =>$validated['projectname'],
        'description'=>$validated['description'] ?? null

        ]);

        //Attach the authenticated user to the team with the role "leader"
        $team->users()->attach($userId, ['role' => 'leader']);

        // Return the team with the associated users (including the leader)
        return response()->json($team->load('users'), 201);

    }


    /**
     * Display the specified resource.
     */
    public function show(Team $team)
    {
        // Load the team with its related users
        $team->load('users');

        // Return the team details as a JSON response
        return response()->json([
            'message' => 'Team retrieved successfully',
            'data' => $team,
        ]);

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

            // Ensure the role is not 'leader'
            if ($role === 'leader') {
                return response()->json([
                    'message' => 'The leader role cannot be assigned through this function.',
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
            'user_ids' => 'required|array', // Array of user IDs to remove
            'user_ids.*' => 'exists:users,id', // Ensure each user ID exists
        ]);

        // Ensure the users to be removed are part of the team
        $usersInTeam = $team->users()->whereIn('user_id', $validated['user_ids'])->pluck('user_id');

        if ($usersInTeam->isEmpty()) {
            return response()->json([
                'message' => 'No valid users to remove from the team.',
            ], 404);
        }

        // Remove the users from the team
        $team->users()->detach($usersInTeam);

        // Return the updated team as a JSON response
        return response()->json([
            'message' => 'Members removed successfully',
            'data' => $team->load('users'), // Load related users
        ], 200);
    }

    public function changeRoles(Request $request, Team $team)
    {
        // Authorize the action (ensure the user can update the team)
        Gate::authorize('update', $team);

        // Validate the request data
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id', // User ID to update
            'role' => 'required|in:member,viewer', // New role (cannot be 'leader')
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

    public function changeLeader(Request $request, Team $team)
    {
        // Authorize the action (ensure the user can update the team)
        Gate::authorize('update', $team);

        // Validate the request data
        $validated = $request->validate([
            'new_leader_id' => 'required|exists:users,id', // New leader's user ID
        ]);

        // Ensure the new leader is part of the team
        if (!$team->users()->where('user_id', $validated['new_leader_id'])->exists()) {
            return response()->json([
                'message' => 'The new leader is not part of this team.',
            ], 404);
        }

        // Get the current leader
        $currentLeader = $team->users()->wherePivot('role', 'leader')->first();

        // If there is a current leader, demote them to a member
        if ($currentLeader) {
            $team->users()->updateExistingPivot($currentLeader->id, [
                'role' => 'member',
            ]);
        }

        // Promote the new leader
        $team->users()->updateExistingPivot($validated['new_leader_id'], [
            'role' => 'leader',
        ]);

        // Return the updated team as a JSON response
        return response()->json([
            'message' => 'Leader changed successfully',
            'data' => $team->load('users'), // Load related users
        ], 200);
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
