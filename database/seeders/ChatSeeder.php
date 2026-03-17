<?php

namespace Database\Seeders;

use App\Models\Chat;
use App\Models\Team;
use Illuminate\Database\Seeder;

class ChatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teams = Team::all();

        // Create 2 chats per team (1 text, 1 voice)
        $teams->each(function (Team $team) {
            Chat::factory()->text()->create(['team_id' => $team->id]);
            Chat::factory()->voice()->create(['team_id' => $team->id]);
        });
    }
}
