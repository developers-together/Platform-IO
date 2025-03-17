<?php

namespace App\Http\Controllers;

use App\Models\Ai_chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\Team;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class Ai_chatController extends Controller
{
    public function sendPrompt(Request $request)
    {
        $prompt = $request->input('prompt');

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' . env('GEMINI_API_KEY'), [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ]);
        return response()->json($response->json());
    }
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

        $result = generativeModel(model: 'models/gemini-1.5-flash-001')->generateContent($validated['prompt']);
        
        $ai_Response =  $result->text();

    //     $stream = Gemini::geminiPro()->generateContent($validated['prompt']);


    // foreach ($stream as $response) {

    //     return response()->streamJson($response->text());
    // }

<<<<<<< HEAD
     $ai_Response =   $stream->text();
=======
    //  $ai_Response =   $stream->text(); 
>>>>>>> cb99507d733ffd9f44d841907b03d4f9c0ca1c30


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
