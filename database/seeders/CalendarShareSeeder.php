<?php

namespace Database\Seeders;

use App\Models\Calendar;
use App\Models\CalendarShare;
use App\Models\User;
use Illuminate\Database\Seeder;

class CalendarShareSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $calendars = Calendar::all();
        $users = User::all();

        // Share each calendar with 1-2 random users
        $calendars->each(function (Calendar $calendar) use ($users) {
            $targets = $users->random(min(2, $users->count()));

            foreach ($targets as $user) {
                CalendarShare::factory()->create([
                    'calendar_id' => $calendar->id,
                    'user_id'     => $user->id,
                ]);
            }
        });
    }
}
