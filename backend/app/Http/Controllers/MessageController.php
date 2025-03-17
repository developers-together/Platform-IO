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

class MessageController extends Controller
{
    use AuthorizesRequests;
    public function sendMessage(Request $request, Chat $chat)
    {
        Gate::authorize('update', $chat);

        // Validate request
        $validated = $request->validate([
            'message' => 'nullable|string',
            'image' => 'nullable', // can be file or base64
            'replyTo' => 'nullable|integer'
        ]);

        $user = Auth::user();
        $path = null;

        // Option 1: Image uploaded as file (FormData)
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images', 'public');
        }

        // Option 2: Image sent as base64 string
        elseif ($request->has('image') && is_string($request->image)) {
            $base64Image = $request->image;

            // Check and decode base64 image
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
                $image = substr($base64Image, strpos($base64Image, ',') + 1);
                $image = str_replace(' ', '+', $image);
                $extension = strtolower($type[1]); // jpg, png, etc.

                $imageName = uniqid() . '.' . $extension;
                Storage::disk('public')->put("images/$imageName", base64_decode($image));

                $path = "images/$imageName";
            } else {
                return response()->json(['success' => false, 'message' => 'Invalid base64 image format'], 422);
            }
        }

        // Save message
        $message = Message::create([
            'chat_id' => $chat->id,
            'user_id' => $user->id,
            'message' => $validated['message'] ?? null,
            'path' => $path,
            'replyTo' => $validated['replyTo'] ?? null,
        ]);

        // Return response
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
            $userName = DB::table('users')->where('id', $message->user_id)->value('name');

            //  If path starts with 'data:image/' → it's base64
            //  Else → treat it as a stored file path
            $image_url = null;

            if ($message->path) {
                if (str_starts_with($message->path, 'data:image/')) {
                    $image_url = $message->path; // Base64 already usable as <img src="">
                } else {
                    $image_url = Storage::url($message->path); // Get public file URL
                }
            }

            return [
                'id' => $message->id,
                'chat_id' => $message->chat_id,
                'user_id' => $message->user_id,
                'user_name' => $userName,
                'message' => $message->message,
                'image_url' => $image_url,
                'replyTo' => $message->replyTo,
                'created_at' => $message->created_at->toDateTimeString(),
            ];
        });

        return response()->json($messages);
    }

}
