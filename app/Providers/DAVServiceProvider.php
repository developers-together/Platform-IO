<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\DAV\Auth\LaravelAuthBackend;
use App\DAV\Nodes\TeamsRootCollection;
use LaravelSabre\LaravelSabre;
use Sabre\DAV\Auth\Plugin as AuthPlugin;
use Sabre\DAV\Browser\Plugin as BrowserPlugin;
use Sabre\DAVACL\Plugin as AclPlugin;
// use Illuminate\Support\Facades\Auth;

class DAVServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // --- Nodes ---
        LaravelSabre::nodes(function () {
            return [
                new TeamsRootCollection(),
            ];
        });

        // --- Plugins ---
        LaravelSabre::plugins(function () {
            // 1. Auth — must be first
            $authBackend = new LaravelAuthBackend();
            yield new AuthPlugin($authBackend, 'MyApp');

            // 2. Browser (optional, useful for debugging via browser)
            if (app()->isLocal()) {
                yield new BrowserPlugin();
            }

            // 3. ACL (optional but recommended for PROPFIND ACL headers)
            $aclPlugin = new AclPlugin();
            $aclPlugin->allowUnauthenticatedAccess = false;
            $aclPlugin->hideNodesFromListings = true; // hides forbidden nodes
            yield $aclPlugin;
        });

        // --- Gate: must be authenticated ---
        LaravelSabre::auth(function () {
            return auth()->check();
        });
    }
    }

