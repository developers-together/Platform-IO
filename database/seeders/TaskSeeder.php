<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\Team;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teams     = Team::all();
        $taskLists = TaskList::all();

        // Create tasks across teams and task lists
        $teams->each(function (Team $team) use ($taskLists) {
            $taskLists->each(function (TaskList $taskList) use ($team) {
                Task::factory(2)->create([
                    'team_id'      => $team->id,
                    'task_list_id' => $taskList->id,
                ]);

                Task::factory()->completed()->create([
                    'team_id'      => $team->id,
                    'task_list_id' => $taskList->id,
                ]);
            });
        });
    }
}
