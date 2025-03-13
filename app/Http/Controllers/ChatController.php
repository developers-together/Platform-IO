<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Chat;

class ChatController extends Controller
{
    public function create(Request $request)
    {
        $chat = Chat::create([
            'name' => $request->name
        ]);
        return response()->json($chat);
    }

//     public function joinChat(Request $request)
//     {
//         $chat = Chat::findOrFail($request->chat_id);
//         $chat->users()->attach($request->user_id);
//         return response()->json(['message' => 'User added to group']);
//     }

    public function destroy(Chat $chat)
    {
        

        try {

            $chat->delete();
            
            return response()->json([
                'message' => 'chat deleted successfully',
                'data' => [
                    'deleted_chat_id' => $chat->id,
                    'deleted_at' => now()->toDateTimeString()
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete chat',
                'error' => $e->getMessage(),
                'chat_id' => $chat->id
            ], 500);
        }
    }

}
