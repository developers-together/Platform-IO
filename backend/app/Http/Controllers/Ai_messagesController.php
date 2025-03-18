<?php

namespace App\Http\Controllers;

use App\Models\Ai_Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\Team;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Models\Ai_Messages;

class Ai_messagesController extends Controller
{

   // Send a prompt to Gemini and store message in chat
   public function sendPrompt(Request $request, Ai_chat $chat)
   {
       $validated = $request->validate([
           'prompt' => 'required|string',
       ]);

       $user = Auth::user();


       // Call Gemini API
       $response = Http::withHeaders([
           'Content-Type' => 'application/json',
       ])->post('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' . env('GEMINI_API_KEY'), [
           'contents' => [
               [
                   'parts' => [
                       ['text' => $validated['prompt']],
                   ]
               ]
           ]
       ]);

       $responseData = $response->json();
       $aiResponse = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '';

       // Save message in ai_messages table
       $message = Ai_Messages::create([
           'user_id' => $user->id,
           'ai_chats_id' => $chat->id,
           'prompt' => $validated['prompt'],
           'response' => $aiResponse,
           'ai' => 'response',
       ]);

       return response()->json($message);
   }

//    public function sendtogemini($prompt){

//      // Call Gemini API
//      $response = Http::withHeaders([
//         'Content-Type' => 'application/json',
//     ])->post('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' . env('GEMINI_API_KEY'), [
//         'contents' => [
//             [
//                 'parts' => [
//                     ['text' => $prompt],
//                 ]
//             ]
//         ]
//     ]);

//     $responseData = $response->json();
//     $aiResponse = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '';
//     return $aiResponse;
//    }

    public function getHistory($chat)
    {
        $history = Ai_Messages::where('ai_chats_id', $chat)
                             ->with('user') // Optional: includes user info
                             ->orderBy('created_at', 'asc') // chronological order
                             ->get();

        return response()->json($history);
    }

}
