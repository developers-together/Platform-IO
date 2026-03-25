<?php

namespace App\Providers;

use App\Services\TurnService;
use Illuminate\Support\ServiceProvider;

class TurnServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(TurnService::class);
    }

    public function boot(): void
    {
        //
    }
}
