<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Models\Team;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TeamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        'description'=>'string',
        'members.*.user_id'=>'integer|unique',
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
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Team $team)
    {
        //
    }
}
