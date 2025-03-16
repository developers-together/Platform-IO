<?php

namespace App\Http\Controllers;

use App\Models\Ai_chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\Team;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Support\Facades\Auth;

class Ai_chatController extends Controller
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
    public function store(Request $request, Team $team)
    {
        Gate::authorize('create',Ai_chat::class);

        $validated = $request->validate([
            'prompt' => 'string|required',
            'name' => 'string|required',
            'ai' => 'string|Required|in:response,action'
        ]);

        $user = AUTH::user();

        $stream = Gemini::geminiPro()->generateContent($validated['prompt']);


    foreach ($stream as $response) {

        return response()->streamJson($response->text());
    }

     $ai_Response =   $stream->text(); 


        $Ai_chat = Ai_chat::create([
            'prompt' => $validated['prompt'],
            'response' => $ai_Response,
            'team_id' => $team->id,
            'user_Id' => $user->id,
            'ai' => validated['ai'],
            'name' => validated['name']
        ]);

    }
    

    /**
     * Display the specified resource.
     */
    public function show(Ai_chat $ai_chat)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Ai_chat $ai_chat)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ai_chat $ai_chat)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ai_chat $ai_chat)
    {
        //
    }
}
