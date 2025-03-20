<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use phpseclib3\Net\SFTP;
use Illuminate\Support\Facades\File;

class SftpServiceProvider extends ServiceProvider
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
    
        public function boot()
        {
            // Create symbolic links for team directories
            // $this->createSftpLinks();
        }
    
        // protected function createSftpLinks()
        // {
        //     $basePath = storage_path('app/sftp');
        //     $teamPath = storage_path('app/public/teams');
    
        //     if (!file_exists($basePath)) {
        //         mkdir($basePath, 0755, true);
        //     }
    
        //     foreach (glob("$teamPath/*") as $teamDir) {
        //         $teamId = basename($teamDir);
        //         $linkPath = "$basePath/$teamId";
                
        //         if (!file_exists($linkPath)) {
        //             symlink($teamDir, $linkPath);
        //             // File::link($teamDir, $linkPath);
        //             // copy($teamDir, $linkPath);
        //         }
        //     }
        // }
}
