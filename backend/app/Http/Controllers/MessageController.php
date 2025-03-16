<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Chat;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    public function sendMessage(Request $request, Chat $chat)
    {
        // Authorize the action
        Gate::authorize('update', $chat);

        // Validate the request
        $validated = $request->validate([
            'message' => 'required|string',
            'image' => 'nullable|image'
        ]);

        // Get the authenticated user's ID
        $id = Auth::id();

        // Store the image (if provided)
        $path = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images', 'public');
        }


        // Create the message
        $message = Message::create([
            'chat_id' => $chat->id, // Use the chat ID from the route model binding
            'user_id' => $id,
            'message' => $validated['message'],
            'path' => $path

        ]);

        return $message->tojson();
    }


    public function getMessages(Chat $chat)
    {
        // Authorize the action
        Gate::authorize('update', $chat);

        // Retrieve paginated messages for the chat
        $messages = Message::where('chat_id', $chat->id)->paginate(5);

        $messages->getCollection()->transform(function ($message) {
            if ($message->image) {
                $message->image = Storage::url($message->image);
            } else {
                $message->image_url = null; // No image
            }
            return $message;
        });

        // Return the paginated messages
        return response()->json($messages);
    }
}
