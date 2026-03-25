<?php

namespace App\Providers;

use App\Services\CoturnAdminService;
use Illuminate\Support\ServiceProvider;

class CoturnAdminServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(CoturnAdminService::class);
    }

    public function boot(): void
    {
        //
    }
}
