<?php

namespace Database\Seeders;

use App\Models\Calendar;
use App\Models\Team;
use Illuminate\Database\Seeder;

class CalendarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teams = Team::all();

        // Create 2 calendars per team
        $teams->each(function (Team $team) {
            Calendar::factory(2)->create([
                'team_id' => $team->id,
            ]);
        });
    }
}
