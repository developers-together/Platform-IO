<?php

namespace Database\Factories;

use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Chat>
 */
class ChatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'    => fake()->words(2, true),
            'team_id' => Team::factory(),
            'type'    => fake()->randomElement(['text', 'voice']),
        ];
    }

    /**
     * Set chat type to text.
     */
    public function text(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'text',
        ]);
    }

    /**
     * Set chat type to voice.
     */
    public function voice(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'voice',
        ]);
    }
}
