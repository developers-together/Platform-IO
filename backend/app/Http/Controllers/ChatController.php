<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chat;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Gate;


class ChatController extends Controller
{
    use AuthorizesRequests;

    // Display all chats
    public function index(Chat $chat)
    {
        $chat = Chat::with('team')->paginate(10);

        return response()->json($chat);
    }

    public function store(Request $request)
    {

        Gate::authorize('create', Chat::class);

       $validated = $request->validate([
            'name' => 'required|string|max:255',
            'team_id' => 'required'
        ]);

      $chat = Chat::create([
      'name'=> $validated['name'],
      'team_id' => $validated['team_id']
      ]);
        return response()->json(['success' => true, 'chat' => $chat]);
    }

    public function show(Chat $chat)
    {
        // Authorize the action
        Gate::authorize('view', $chat);

        // Return the chat details as a JSON response
        return response()->json([
            'message' => 'Chat retrieved successfully',
            'data' => $chat,
        ]);
    }

    public function update(Request $request , Chat $chat)
    {
        Gate::authorize('update', $chat);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $chat->update([
            'name'=> $validated['name'],
        ]);

        return response()->json(['success' => true, 'chat' => $chat]);
    }

    public function destroy(Chat $chat, Request $request)
    {
        $this->authorize('delete', $chat);

        $validated = $request->validate([
            'chat_id' => 'required|exists:chats,id',
        ]);

        $chat = Chat::find($validated['chat_id']);

        if (!$chat) {
            return response()->json(['success' => false, 'message' => 'Chat not found'], 404);
        }

        $chat->delete();
        return response()->json(['success' => true]);
    }


}
