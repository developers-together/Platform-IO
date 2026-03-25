<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'coturn' => [
        'secret'         => env('TURN_SECRET'),
        'host'           => env('TURN_HOST', 'localhost'),
        'port'           => env('TURN_PORT', 3478),
        'tls_port'       => env('TURN_TLS_PORT', 5349),
        'ttl'            => env('TURN_TTL', 3600),
        'admin_url'      => env('COTURN_ADMIN_URL', 'http://127.0.0.1:8080'),
        'admin_host'     => env('COTURN_ADMIN_HOST', '127.0.0.1'),
        'admin_port'     => env('COTURN_ADMIN_PORT', 5766),
        'admin_timeout'  => env('COTURN_ADMIN_TIMEOUT', 3),
        'admin_password' => env('COTURN_ADMIN_PASSWORD'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
