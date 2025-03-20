<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Policies\MessagePolicy;
use App\Models\Message;
use Illuminate\Support\Facades\Schema;


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
        Schema::disableForeignKeyConstraints();
    }

    protected $policies = [
        Message::class => MessagePolicy::class,
    ];


}
