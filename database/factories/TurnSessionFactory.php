<?php

namespace Database\Factories;

use App\Models\TurnSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TurnSession>
 */
class TurnSessionFactory extends Factory
{
    protected $model = TurnSession::class;

    public function definition(): array
    {
        $expiry = now()->addHour()->timestamp;

        return [
            'user_id' => User::factory(),
            'username' => "{$expiry}:{$this->faker->unique()->numberBetween(1, 999999)}",
            'room_id' => 'voice-' . $this->faker->numberBetween(1, 999),
            'expires_at' => now()->addHour(),
            'terminated_at' => null,
        ];
    }

    public function terminated(): static
    {
        return $this->state(fn (): array => [
            'terminated_at' => now(),
        ]);
    }
}
