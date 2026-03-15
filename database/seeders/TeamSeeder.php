<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        // Create 5 teams
        Team::factory(5)->create()->each(function (Team $team) use ($users) {
            // Assign 2-4 random users to each team
            $members = $users->random(rand(2, min(4, $users->count())));

            foreach ($members as $index => $user) {
                $team->users()->attach($user->id, [
                    'role' => $index === 0 ? 'admin' : fake()->randomElement(['member', 'viewer']),
                ]);
            }
        });
    }
}
