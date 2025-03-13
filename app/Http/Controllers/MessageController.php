<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function sendMessage(Request $request)
    {
        $message = Message::create([
            'user_id' => $request->user_id,
            'chat_id' => $request->chat_id,
            'message' => $request->message
        ]);
        return response()->json($message);
    }


    public function getMessages($chatId)
    {
        $messages = Message::where('chat_id', $chatId)->with('user')->get();
        return response()->json($messages);
    }
}
