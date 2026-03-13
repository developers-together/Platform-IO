<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comm;
use Illuminate\Support\Facades\Gate;
use App\Models\Team;
use Inertia\Inertia;

class CommunicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Team $team)
    {
        $contacts = Comm::where('team_id',$team->id);

        Inertia::render('/team/{team/communication',[
            'contacts'=>$contacts
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
    public function store(Request $request, Team $team)
    {
        Gate::authorize('update',$team);

        $validated = $request->validate([
            'contact' => 'array'
        ]);

        foreach($validated['contacts'] as $contact){
            Comm::create([
                'team_id' => $team->id,
                'contact' =>$contact
                ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Comm $contact, Team $team)
    {
        Gate::authorize('update',$team);
        $validated = $request->validate(['contact'=> 'string']);

        $contact->contact = $validated['contact'];

        $contact->save();

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Comm $contact, Team $team)
    {
        Gate::authorize('update',$team);

        $contact->delete();
    }
}
