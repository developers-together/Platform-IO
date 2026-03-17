<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Core
            UserSeeder::class,
            TeamSeeder::class,

            // Team-dependent
            ChatSeeder::class,
            CalendarSeeder::class,
            TaskSeeder::class,

            // Stand-alone
            ContactSeeder::class,
            CommunicationSeeder::class,

            // Chat-dependent
            ChatPermSeeder::class,
            MessageSeeder::class,

            // Calendar-dependent
            CalendarShareSeeder::class,
        ]);
    }
}
