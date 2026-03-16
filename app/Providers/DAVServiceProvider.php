<?php


namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\DAV\Auth\LaravelAuthBackend;
use App\DAV\Nodes\TeamsRootCollection;
use App\DAV\CalDAV\CalendarBackend;
use App\DAV\CalDAV\PrincipalBackend;
use LaravelSabre\LaravelSabre;
use Sabre\CalDAV\Plugin as CalDAVPlugin;
use Sabre\CalDAV\CalendarRoot;
use Sabre\DAV\Auth\Plugin as AuthPlugin;
use Sabre\DAV\Browser\Plugin as BrowserPlugin;
use Sabre\DAVACL\Plugin as AclPlugin;
use Sabre\DAVACL\PrincipalCollection;

class DAVServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // --- Nodes ---
        LaravelSabre::nodes(function () {
            $principalBackend = new PrincipalBackend();
            $calendarBackend  = new CalendarBackend();

            return [
                // Required by CalDAV — must come first
                new PrincipalCollection($principalBackend),

                // CalDAV calendar tree
                new CalendarRoot($principalBackend, $calendarBackend),

                // WebDAV file tree
                new TeamsRootCollection(),
            ];
        });

        // --- Plugins ---
        LaravelSabre::plugins(function () {
            // 1. Auth — must always be first
            $authBackend = new LaravelAuthBackend();
            yield new AuthPlugin($authBackend, 'MyApp');

            // 2. CalDAV — handles all VCALENDAR/VEVENT requests
            yield new CalDAVPlugin();

            // 3. ACL — required by CalDAV, must come after CalDAV plugin
            $aclPlugin = new AclPlugin();
            $aclPlugin->allowUnauthenticatedAccess = false;
            $aclPlugin->hideNodesFromListings = true;
            yield $aclPlugin;

            // 4. Browser — local debugging only
            if (app()->isLocal()) {
                yield new BrowserPlugin();
            }
        });

        // --- Gate: must be authenticated ---
        LaravelSabre::auth(function () {
            return auth()->check();
        });
    }
}
