<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Policies\MessagePolicy;
use App\Models\Message;
use Illuminate\Support\Facades\Schema;
use Throwable;


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
        try {
            Schema::disableForeignKeyConstraints();
        } catch (Throwable) {
            // Ignore bootstrap-time DB availability issues (e.g. CLI tooling/tests env).
        }
    }

    protected $policies = [
        Message::class => MessagePolicy::class,
    ];


}
