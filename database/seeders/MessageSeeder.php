<?php

namespace Database\Seeders;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $chats = Chat::all();

        // Seed 3 messages per chat
        $chats->each(function (Chat $chat) {
            Message::factory(3)->create([
                'chat_id' => $chat->id,
            ]);
        });
    }
}
