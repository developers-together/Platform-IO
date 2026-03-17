<?php

namespace Database\Factories;

use App\Models\Chat;
use App\Models\ChatPerm;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChatPerm>
 */
class ChatPermFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'chat_id'  => Chat::factory(),
            'write'    => fake()->boolean(70),
            'read'     => true,
            'delete'   => fake()->boolean(40),
            'modify'   => fake()->boolean(50),
            'notify'   => fake()->boolean(80),
            'allow_ai' => fake()->boolean(60),
        ];
    }

    /**
     * Grant all permissions.
     */
    public function allPermissions(): static
    {
        return $this->state(fn (array $attributes) => [
            'write'    => true,
            'read'     => true,
            'delete'   => true,
            'modify'   => true,
            'notify'   => true,
            'allow_ai' => true,
        ]);
    }

    /**
     * Read-only permissions (no write/delete/modify).
     */
    public function readOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'write'    => false,
            'read'     => true,
            'delete'   => false,
            'modify'   => false,
            'notify'   => true,
            'allow_ai' => false,
        ]);
    }
}
