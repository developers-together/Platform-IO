<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chat;
use App\Models\ChatPerm;
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
        Gate::authorize('viewAny', Auth::User(), $team);

        $chats = Chat::where('team_id', $team->id)->get();

        return $chats->toJson();
    }


    public function store(Request $request, Team $team)
    {
        $user = Auth::user();

        Gate::authorize('create', $user, $team);

       $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:text,voice'
        ]);

            $chat = Chat::create([
                'name'=> $validated['name'],
                'type'=> $validated['type'],
                'team_id' => $team->id
                ]);

        ChatPerm::create([

            'write' => true,
            'read' => true,
            'modify' => true,
            'notify' => true,
            'delete' => true,
            'allow_ai' => false,
            'chat_id' => $chat->id
        ]);

        return $chat->toJson();
    }

    public function show(Chat $chat)
    {
        // Authorize the action
        Gate::authorize('view',Auth::user(), $chat->with('chatPerm'));

        // Return the chat details as a JSON response
        return $chat->toJson();
    }

    public function update(Request $request , Chat $chat)
    {
        $user = Auth::user();
        Gate::authorize('update',$user, $chat);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:text,voice'

        ]);


        if($chat->team->users()->where('user_id', $user->id)){

        $chat->update([
            'name'=> $validated['name'],
        ]);
    }

        return $chat->toJson();
    }

    public function destroy(Chat $chat, Request $request)
    {
        $user = Auth::user();
        Gate::authorize('delete',$user, $chat);

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
