<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\Team;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teams = Team::all();

        // Create 3 tasks per team (mix of priorities/states)
        $teams->each(function (Team $team) {
            Task::factory(2)->create(['team_id' => $team->id]);
            Task::factory()->completed()->create(['team_id' => $team->id]);
        });
    }
}
