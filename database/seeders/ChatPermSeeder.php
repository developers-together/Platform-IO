<?php

namespace Database\Seeders;

use App\Models\Chat;
use App\Models\ChatPerm;
use Illuminate\Database\Seeder;

class ChatPermSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $chats = Chat::all();

        // Create one permission record per chat
        $chats->each(function (Chat $chat) {
            ChatPerm::factory()->create([
                'chat_id' => $chat->id,
            ]);
        });
    }
}
