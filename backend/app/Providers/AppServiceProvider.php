<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Policies\MessagePolicy;
use App\Models\Message;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }

    protected $policies = [
        Message::class => MessagePolicy::class,
    ];


}
