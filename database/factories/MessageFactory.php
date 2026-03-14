<?php

namespace Database\Factories;

use App\Models\Chat;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'  => User::factory(),
            'chat_id'  => Chat::factory(),
            'message'  => fake()->sentence(),
            'path'     => null,
            'reply_to' => null,
        ];
    }

    /**
     * Create a message with an attachment path.
     */
    public function withAttachment(): static
    {
        return $this->state(fn (array $attributes) => [
            'path' => 'attachments/' . fake()->uuid() . '.' . fake()->fileExtension(),
        ]);
    }

    /**
     * Create a message that is a reply to another message.
     */
    public function replyTo(int $messageId): static
    {
        return $this->state(fn (array $attributes) => [
            'reply_to' => $messageId,
        ]);
    }
}
