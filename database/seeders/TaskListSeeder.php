<?php

namespace Database\Seeders;

use App\Models\TaskList;
use Illuminate\Database\Seeder;

class TaskListSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TaskList::factory()->create(['title' => 'Backlog']);
        TaskList::factory()->create(['title' => 'In Progress']);
        TaskList::factory()->create(['title' => 'Completed']);
    }
}
