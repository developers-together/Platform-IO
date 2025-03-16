<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Chat;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    public function sendMessage(Request $request, Chat $chat)
    {
        // Authorize the action
        Gate::authorize('update', $chat);

        // Validate the request
        $validated = $request->validate([
            'message' => 'nullable|string',
            'image' => 'nullable|image',
            'replayTo' => 'nullable|string'
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
            'replayTo' => $validated['replayTo'] ?? null,
        ]);

        // Build a custom response array
        $response = [
            'id' => $message->id,
            'chat_id' => $message->chat_id,
            'user_id' => $message->user_id,
            'user_name' => $user->name,
            'message' => $message->message,
            'image_url' => $message->path ? Storage::url($message->path) : null,
            'replayTo' => $message->replayTo,
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

        $messages = Message::where('chat_id', $chat->id)->paginate(5);

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
                'replayTo' => $message->replayTo,
                'created_at' => $message->created_at->toDateTimeString(),
            ];
        });

        return response()->json($messages);
    }

}
