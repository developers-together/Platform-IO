<?php

namespace Database\Seeders;

use App\Models\Comm;
use Illuminate\Database\Seeder;

class CommunicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 3 communication records
        Comm::factory(3)->create();
    }
}
