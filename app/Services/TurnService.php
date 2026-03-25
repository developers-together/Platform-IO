<?php

namespace App\Services;

use App\Models\TurnSession;
use RuntimeException;

class TurnService
{
    public function __construct(private readonly CoturnAdminService $coturnAdmin)
    {
    }

    public function generateCredentials(?int $userId = null, ?string $roomId = null): array
    {
        $ttl = (int) config('services.coturn.ttl', 3600);
        $secret = (string) config('services.coturn.secret', '');
        $host = (string) config('services.coturn.host', '127.0.0.1');
        $port = (int) config('services.coturn.port', 3478);
        $tlsPort = (int) config('services.coturn.tls_port', 5349);

        if ($secret === '') {
            throw new RuntimeException('TURN secret is not configured.');
        }

        $timestamp = now()->timestamp + $ttl;
        $identifier = $userId ?? 'guest';
        $username = "{$timestamp}:{$identifier}";

        $credential = base64_encode(hash_hmac('sha1', $username, $secret, true));

        if ($userId !== null) {
            TurnSession::create([
                'user_id' => $userId,
                'username' => $username,
                'room_id' => $roomId,
                'expires_at' => now()->addSeconds($ttl),
            ]);
        }

        $iceServers = [
                [
                    'urls' => ["stun:{$host}:{$port}"],
                ],
                [
                    'urls' => [
                        "turn:{$host}:{$port}?transport=udp",
                        "turn:{$host}:{$port}?transport=tcp",
                    ],
                    'username' => $username,
                    'credential' => $credential,
                ],
                [
                    'urls' => ["turns:{$host}:{$tlsPort}?transport=tcp"],
                    'username' => $username,
                    'credential' => $credential,
                ],
            ];

        return [
            'ice_servers' => $iceServers,
            'iceServers' => $iceServers,
            'ttl' => $ttl,
            'username' => $username,
        ];
    }

    public function terminateUserSessions(int $userId): void
    {
        TurnSession::where('user_id', $userId)
            ->active()
            ->update(['terminated_at' => now()]);

        $this->coturnAdmin->terminateUserSessions($userId);
    }

    public function terminateSessionForUser(int $userId, string $username): bool
    {
        $updated = TurnSession::where('user_id', $userId)
            ->where('username', $username)
            ->active()
            ->update(['terminated_at' => now()]);

        if ($updated > 0) {
            $this->coturnAdmin->terminateByUsername($username);
            return true;
        }

        return false;
    }

    public function terminateSession(string $username): void
    {
        TurnSession::where('username', $username)
            ->whereNull('terminated_at')
            ->update(['terminated_at' => now()]);

        $this->coturnAdmin->terminateByUsername($username);
    }
}
