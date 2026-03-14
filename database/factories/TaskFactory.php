<?php

namespace Database\Factories;

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
            'title'          => fake()->sentence(4),
            'starred'        => fake()->boolean(20),
            'description'    => fake()->optional(0.7)->paragraph(),
            'deadline'       => fake()->optional(0.6)->dateTimeBetween('now', '+3 months'),
            'completed'      => false,
            'team_id'        => Team::factory(),
            'priority'       => fake()->randomElement(['must', 'should', 'could', 'willnot']),
            'parent_task_id' => null,
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
     * Mark the task as starred.
     */
    public function starred(): static
    {
        return $this->state(fn (array $attributes) => [
            'starred' => true,
        ]);
    }

    /**
     * Set task priority to "must".
     */
    public function mustPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'must',
        ]);
    }

    /**
     * Set task priority to "should".
     */
    public function shouldPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'should',
        ]);
    }
}
