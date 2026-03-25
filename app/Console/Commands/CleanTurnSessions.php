<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TurnSession;

class CleanTurnSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'turn:clean';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete expired and terminated TURN sessions from the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = TurnSession::inactive()->delete();

        $this->info("Deleted {$count} stale TURN sessions.");

        return Command::SUCCESS;
    }
}
