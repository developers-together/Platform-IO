<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Chat;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Http;



class MessageController extends Controller
{
    use AuthorizesRequests;
    public function sendMessage(Request $request, Chat $chat)
    {
        // Authorize the action
        Gate::authorize('update', $chat);

        // Validate the request
        $validated = $request->validate([
            'message' => 'nullable|string',
            'image' => 'nullable|image',
            'replyTo' => 'nullable|integer'
        ]);

        $user = Auth::user(); // Get the user object

        // Store the image if provided
        $path = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images', 'public');
        }

        // Create the message
        $message = Message::create([
            'chat_id' => $chat->id,
            'user_id' => $user->id,
            'message' => $validated['message'] ?? null,
            'path' => $path,
            'replyTo' => $validated['replyTo'] ?? null,
        ]);

        // Build a custom response array
        $response = [
            'id' => $message->id,
            'chat_id' => $message->chat_id,
            'user_id' => $message->user_id,
            'user_name' => $user->name,
            'message' => $message->message,
            'image_url' => $message->path ? Storage::url($message->path) : null,
            'replyTo' => $message->replyTo,
            'created_at' => $message->created_at->toDateTimeString(),
        ];

        return response()->json([
            'success' => true,
            'message' => $response,
        ]);
    }

    public function getMessages(Chat $chat)
    {
        Gate::authorize('update', $chat);

        $messages = Message::where('chat_id', $chat->id)->paginate(1000);

        $messages->getCollection()->transform(function ($message) {
            // Get the user's name manually without defining a user() relationship
            $userName = DB::table('users')->where('id', $message->user_id)->value('name');

            return [
                'id' => $message->id,
                'chat_id' => $message->chat_id,
                'user_id' => $message->user_id,
                'user_name' => $userName,
                'message' => $message->message,
                'image_url' => $message->path ? Storage::url($message->path) : null,
                'replyTo' => $message->replyTo,
                'created_at' => $message->created_at->toDateTimeString(),
            ];
        });

        return response()->json($messages);
    }

    public function destroy(Message $message)
    {
        $this->authorize('delete', $message); // Assuming your policy handles user ownership

        // Extra fallback check (if no policy or just to double secure it)
        $user = Auth::user();

        if ($message->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Delete the image from storage if it exists
        if ($message->path) {
            Storage::disk('public')->delete($message->path);
        }

        $message->delete();

        return response()->json(['success' => true]);
    }

    public function sendtogemini($prompt){

        // Call Gemini API
        $response = Http::withHeaders([
           'Content-Type' => 'application/json',
       ])->post('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=' . env('GEMINI_API_KEY'), [
           'contents' => [
               [
                   'parts' => [
                       ['text' => $prompt],
                   ]
               ]
           ]
       ]);

       $responseData = $response->json();
       $aiResponse = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '';
       return $aiResponse;
      }


      public function askgemini(Request $request, Chat $chat){
        $validated = $request->validate([
            'prompt' => ['required', 'string'],
        ]);

        $aiResponse = $this->sendtogemini($validated['prompt']);

        $message1 = Message::create([
            'user_id' => Auth::id(),
            'chat_id' => $chat->id,
            'message' => $validated['prompt']
            'message' => $validated['prompt'],
            'replyTo' => $aiResponse
        ]);

        $message2 = Message::create([
            'user_id' => Auth::id(),
            'chat_id' => $chat->id,
            'message' => $aiResponse
        ]);
        // $message2 = Message::create([
        //     'user_id' => Auth::id(),
        //     'chat_id' => $chat->id,
        //     'message' => $aiResponse
        // ]);

        return response()->json(['success' => true, 'messages' => [$message1, $message2]]);
      }

}
