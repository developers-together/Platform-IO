<?php

namespace App\Listeners;

use App\Services\TurnService;
use Illuminate\Auth\Events\Logout;
use Illuminate\Events\Attributes\ListensTo;

#[ListensTo(Logout::class)]
class TerminateTurnOnLogout
{
    public function __construct(private readonly TurnService $turn)
    {
    }

    public function handle(Logout $event): void
    {
        if ($event->user) {
            $this->turn->terminateUserSessions($event->user->id);
        }
    }
}
