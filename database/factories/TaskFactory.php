<?php

namespace Database\Factories;

use App\Models\TaskList;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title'        => fake()->sentence(4),
            'description'  => fake()->optional(0.7)->paragraph(),
            'deadline'     => fake()->optional(0.6)->dateTimeBetween('now', '+3 months'),
            'completed'    => false,
            'team_id'      => Team::factory(),
            'priority'     => fake()->randomElement(['high', 'medium', 'low']),
            'task_list_id' => TaskList::factory(),
        ];
    }

    /**
     * Mark the task as completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed' => true,
        ]);
    }

    /**
     * Set task priority to "high".
     */
    public function highPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'high',
        ]);
    }

    /**
     * Set task priority to "low".
     */
    public function lowPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'low',
        ]);
    }
}
