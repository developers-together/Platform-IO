<?php

namespace App\Http\Controllers;

use App\Models\Ai_chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\Team;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Models\Ai_Messages;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class Ai_messagesController extends Controller
{

   // Send a prompt to Gemini and store message in chat
   public function sendPrompt(Request $request, Ai_chat $chat)
   {
       $validated = $request->validate([
           'prompt' => 'required|string',
           'image' => 'nullable|image|max:5120'
       ]);

       $user = Auth::user();
       $imagePath = null;

       $contents = [
            [
                'parts' => [
                    ['text' => $validated['prompt']]
                ]
            ]
        ];

        // Handle Image Upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('uploads', 'public');
            $imageBase64 = base64_encode(file_get_contents(storage_path("app/public/{$imagePath}")));

            $contents[0]['parts'][] = [
                'inline_data' => [
                    'mime_type' => $request->file('image')->getMimeType(),
                    'data' => $imageBase64
                ]
            ];
        }

        $history = Ai_Messages::where('ai_chats_id', $chat)
        ->orderBy('created_at', 'desc') // Latest first
        ->take(5) // Get only 5 records
        ->get();
        
        $inputtext = "use the following history to help the user with ther problem". $history . "here is the prompt: " . $contents;

       // Call Gemini API
       $response = Http::withHeaders([
           'Content-Type' => 'application/json',
       ])->post('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=' . env('GEMINI_API_KEY'), [
            'contents' => $inputtext
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
           'image_path' => $imagePath,
       ]);

       return response()->json($message);
   }

    public function getHistory($chat)
    {
        $history = Ai_Messages::where('ai_chats_id', $chat)
                             ->with('user') // Optional: includes user info
                             ->orderBy('created_at', 'asc') // chronological order
                             ->get()
                             ->map(function ($message) {
                                // Add full image URL if image exists
                                if ($message->image_path) {
                                    $message->image_url = asset('storage/' . $message->image_path);
                                }
                                return $message;
                            });

        return response()->json($history);
    }

    public function websearch(Request $request, Ai_chat $chat)
        {
        $validated = $request->validate([
            'prompt' => 'required|string'
        ]);

        $user = Auth::user();
        $apiKey = env('GEMINI_API_KEY');
        $prompt = $validated['prompt'];

        // Execute Python script
        $pythonScript = storage_path('app/scripts/gemini_api.py');
        $process = new Process(['python', $pythonScript, $apiKey, $prompt]);

        $process->run();

        if (!$process->isSuccessful()) {
            return response()->json([
                'error' => 'Script execution failed',
                'details' => $process->getErrorOutput()
            ], 500);
        }

        $output = json_decode($process->getOutput(), true);
        $aiResponse = $output['response'] ?? '';

        // Save response in ai_messages table
        $message = Ai_Messages::create([
            'user_id' => $user->id,
            'ai_chats_id' => $chat->id,
            'prompt' => $prompt,
            'response' => $aiResponse,
            'ai' => 'response',
            'image_path' => null, // No image in web search
        ]);

        return response()->json($message);
    }
}
