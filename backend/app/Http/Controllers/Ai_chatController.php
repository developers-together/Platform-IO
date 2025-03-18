<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ai_chat;
use App\Models\Team;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;


class Ai_chatController extends Controller
{
    use AuthorizesRequests;

    // Display all ai chats
    public function index(Team $team)
    {
        // Gate::authorize('viewAny', Ai_Chat::class);

        $ai_chats = Ai_Chat::where('team_id', $team->id)->get();

        return response()->json($ai_chats);
    }




    public function store(Request $request, Team $team)
    {

        // Gate::authorize('create', Ai_Chat::class);

       $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $user = Auth::user();

        if($team->users()->where('user_id', $user->id)){

            $ai_chat = Ai_Chat::create([
                'name'=> $validated['name'],
                'team_id' => $team->id
                ]);
        }

        return $ai_chat->toJson();
    }

    public function show(Ai_Chat $ai_chat)
    {
        // Authorize the action
        // Gate::authorize('view', $ai_chat);

        // Return the chat details as a JSON response
        return $ai_chat->toJson();
    }

    public function destroy(Chat $ai_chat)
    {
        // $this->authorize('delete', $ai_chat);

        $user = Auth::user();

        if (!$ai_chat->team || !$ai_chat->team->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized or team not found'], 403);
        }

        $ai_chat->delete();

        return response()->json(['success' => true, 'message' => 'Chat deleted successfully']);
    }
}
