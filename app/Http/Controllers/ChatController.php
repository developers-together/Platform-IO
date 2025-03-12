<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function create(Request $request)
    {
        $chat = Chat::create([
            'name' => $request->name
        ]);
        return response()->json($chat);
    }

    public function joinChat(Request $request)
    {
        $chat = Group::findOrFail($request->chat_id);
        $chat->users()->attach($request->user_id);
        return response()->json(['message' => 'User added to group']);
    }
}
