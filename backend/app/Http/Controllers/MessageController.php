<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Chat;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function sendMessage(Request $request)
    {

        $validated = $request->validate([
        'chat_id' => 'required',
        'message' => 'required|string'
        ]);

        $id = Auth::id();
        if(chat::where('id',$validated['chat_id'])){
        $message = Message::create([
        'chat_id' => $validated['chat_id'],
        'user_id' => $id,
        'message' => $validated['message']
        ]);

        return response()->json($message);
    
    }

    return response()->json('error');
        
    }


    public function getMessages($chatId)
    {
        $messages = Message::where('chat_id', $chatId)->pivot('message')->with('user')->get();
        return response()->json($messages);
    }
}
