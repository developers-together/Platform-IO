<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Models\Team;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Gate;

class TeamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Paginate teams with their members
        $teams = Team::with(['users' => function ($query) {
            $query->select('users.id', 'users.name', 'users.email')
                  ->withPivot('role');
        }])->paginate(10);

        // Format the response
    return response()->json([
        'message' => 'Teams retrieved successfully',
        'data' => $teams->through(function ($team) {
            return [
                'id' => $team->id,
                'name' => $team->name,
                'projectname' => $team->projectname,
                'description' => $team->description,
                'created_at' => $team->created_at->toDateTimeString(),
                'updated_at' => $team->updated_at->toDateTimeString(),
                'member_count' => $team->users->count(),
                'members' => $team->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->pivot->role,
                        'joined_at' => $user->pivot->created_at->toDateTimeString()
                    ];
                })
            ];
        })
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
    public function store(StoreTeamRequest $request)
    {
        $validated = $request->validate([
        'name'=>'string|required|max:255',
        'projectname'=>'string|required|max:255',
        'description'=>'string|nullable',
        'members.*.user_id'=>'integer|distinct|exists:users,id',
        'members.*.role'=>['required',Rule::in(['leader','member','viewer'])],
        'members' => [
            'sometimes',
            'array',
            function ($attribute, $value, $fail) {
                $leaderCount = collect($value)->where('role', 'leader')->count();
                if ($leaderCount !== 1) {
                    $fail('A team must have exactly one leader.');
                }
            }
        ]

        ]);

       $team = Team::create([
       'name'=> $validated['name'],
       'projectname' =>$validated['projectname'],
        'description'=>$validated['description'] ?? null
    
    ]);

    if (isset($validated['members'])) {
        $this->attachMembersWithRoles($team, $validated['members']);
    }

    return response()->json($team->load('users'), 201);

    }

    protected function attachMembersWithRoles(Team $team, array $members)
    {

        $leaders = collect($members)->where('role', 'leader');
    
        if ($leaders->count() !== 1) {
            abort(422, 'Team must have exactly one leader');
        }

        // Transform members array to pivot format
        $pivotData = collect($members)->mapWithKeys(function ($member) {
            return [
                $member['user_id'] => ['role' => $member['role']]
            ];
        })->toArray();

        $team->users()->attach($pivotData);
    
    }

    /**
     * Display the specified resource.
     */
    public function show(Team $team)
    {
         // Eager load users with their roles
    $team->load(['users' => function ($query) {
        $query->select('users.id', 'users.name', 'users.email')
              ->withPivot('role');
    }]);

    // Format the response
    return response()->json([
        'message' => 'Team retrieved successfully',
        'data' => [
            'id' => $team->id,
            'name' => $team->name,
            'projectname' => $team->projectname,
            'description' => $team->description,
            'created_at' => $team->created_at->toDateTimeString(),
            'updated_at' => $team->updated_at->toDateTimeString(),
            'members' => $team->users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->pivot->role,
                    'joined_at' => $user->pivot->created_at->toDateTimeString()
                ];
            })
        ]
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
    public function update(UpdateTeamRequest $request, Team $team)
    {

        Gate::authorize('update', $team);

        $validated = $request->validate([
            'name'=>'string|required|max:255',
            'projectname'=>'string|required|max:255',
            'description'=>'string|nullable',
            'members.*.user_id'=>'integer|distinct|exists:users,id',
            'members.*.role'=>['required',Rule::in(['leader','member','viewer'])],
            'members' => [
                'sometimes',
                'array',
                function ($attribute, $value, $fail) {
                    $leaderCount = collect($value)->where('role', 'leader')->count();
                    if ($leaderCount !== 1) {
                        $fail('A team must have exactly one leader.');
                    }
                }
            ]
    
        ]);

        $team->update([
            'name' => $validated['name'],
            'projectname' => $validated['projectname'],
            'description' => $validated['description'] ?? null
        ]);

            if (isset($validated['members'])) {
                $this->syncMembersWithRoles($team, $validated['members']);
            }
        
            return response()->json($team->fresh()->load('users'), 200);
        

    }

    protected function syncMembersWithRoles(Team $team, array $members)
    {

        $leaders = collect($members)->where('role', 'leader');
    
        if ($leaders->count() !== 1) {
            abort(422, 'Team must have exactly one leader');
        }

        // Transform members array to pivot format
        $pivotData = collect($members)->mapWithKeys(function ($member) {
            return [
                $member['user_id'] => ['role' => $member['role']]
            ];
        })->toArray();

        $team->users()->sync($pivotData);
    
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
