<?php

namespace Database\Factories;

use App\Models\Calendar;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Calendar>
 */
class CalendarFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'name'    => fake()->words(fake()->numberBetween(1, 3), true),
            'color'   => fake()->hexColor(),
            'uri'     => (string) Str::uuid(),
        ];
    }
}
