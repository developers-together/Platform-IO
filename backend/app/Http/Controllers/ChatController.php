<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chat;
use App\Models\Team;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;


class ChatController extends Controller
{
    use AuthorizesRequests;

    // Display all chats
    public function index(Team $team)
    {
        Gate::authorize('viewAny', Chat::class);


        $chat = Chat::where('team_id', $team->id)->get();

        return response()->json($chat);
    }

    public function store(Request $request, Team $team)
    {

        Gate::authorize('create', Chat::class);

       $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $user = Auth::user();
        
        if($team->users()->where('user_id', $user->id)){

            $chat = Chat::create([
                'name'=> $validated['name'],
                'team_id' => $team->id
                ]);
        }

    
        return response()->json($chat);
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

        $user = Auth::user();
        
        if($chat->team->users()->where('user_id', $user->id)){

        $chat->update([
            'name'=> $validated['name'],
        ]);
    }

        return response()->json($chat);
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

        $user = Auth::user();

        if($chat->team->users()->where('user_id', $user->id)){

        $chat->delete();
        }
        
        return response()->json(['success' => true]);
    }


}
