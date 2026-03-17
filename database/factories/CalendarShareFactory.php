<?php

namespace Database\Factories;

use App\Models\Calendar;
use App\Models\CalendarShare;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CalendarShare>
 */
class CalendarShareFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'calendar_id' => Calendar::factory(),
            'user_id'     => User::factory(),
            'permission'  => fake()->randomElement(['read', 'write']),
        ];
    }

    /**
     * Set permission to read-only.
     */
    public function readOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'permission' => 'read',
        ]);
    }

    /**
     * Set permission to write.
     */
    public function writable(): static
    {
        return $this->state(fn (array $attributes) => [
            'permission' => 'write',
        ]);
    }
}
