<?php

namespace Database\Factories;

use App\Models\Comm;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comm>
 */
class CommunicationFactory extends Factory
{
    protected $model = Comm::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'contact' => fake()->randomElement([
                fake()->safeEmail(),
                fake()->phoneNumber(),
                fake()->url(),
            ]),
        ];
    }

    /**
     * Set the contact as an email address.
     */
    public function email(): static
    {
        return $this->state(fn (array $attributes) => [
            'contact' => fake()->safeEmail(),
        ]);
    }

    /**
     * Set the contact as a phone number.
     */
    public function phone(): static
    {
        return $this->state(fn (array $attributes) => [
            'contact' => fake()->phoneNumber(),
        ]);
    }

    /**
     * Set the contact as a URL.
     */
    public function url(): static
    {
        return $this->state(fn (array $attributes) => [
            'contact' => fake()->url(),
        ]);
    }
}
