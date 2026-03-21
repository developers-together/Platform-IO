<?php

namespace Database\Factories;

use App\Models\TaskList;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TaskList>
 */
class TaskListFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title'   => fake()->words(fake()->numberBetween(1, 4), true),
            'team_id' => Team::factory(),
        ];
    }
}
