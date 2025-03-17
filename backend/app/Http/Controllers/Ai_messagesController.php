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
        $user = Auth::user();

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

        $responseData = $response->json();
        $aiResponse = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '';

        // Save to database
        $chat = Ai_chat::create([
            'name' => 'Chat #' . now()->timestamp,
            'prompt' => $prompt,
            'response' => $aiResponse,
            'user_id' => $user->id,
            'team_id' => $user->current_team_id,
            'ai' => 'response',
        ]);

        return response()->json($chat);
    }

    public function getHistory()
    {
        $user = Auth::user();
        $history = Ai_chat::where('user_id', $user->id)
                          ->where('team_id', $user->current_team_id)
                          ->orderBy('created_at', 'desc')
                          ->get();

        return response()->json($history);
    }



}
