<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class CoturnAdminService
{
    private string $host;
    private int $port;
    private int $timeout;
    private string $password;

    public function __construct()
    {
        $this->host = (string) config('services.coturn.admin_host', '127.0.0.1');
        $this->port = (int) config('services.coturn.admin_port', 5766);
        $this->timeout = (int) config('services.coturn.admin_timeout', 3);
        $this->password = (string) config('services.coturn.admin_password', '');
    }

    public function getSessions(): array
    {
        $output = $this->runCommand('ps');
        return $output === null ? [] : $this->parseSessions($output);
    }

    public function getUserSessions(int $userId): array
    {
        $needle = ':' . $userId;

        return array_values(array_filter(
            $this->getSessionsByPartialUsername($needle),
            fn (array $session): bool => str_ends_with((string) ($session['username'] ?? ''), $needle)
        ));
    }

    public function terminateSession(string $sessionId): bool
    {
        $sessionId = $this->sanitizeCliToken($sessionId);

        if ($sessionId === '') {
            return false;
        }

        return $this->runCommand("cs {$sessionId}") !== null;
    }

    public function terminateUserSessions(int $userId): void
    {
        foreach ($this->getUserSessions($userId) as $session) {
            $sessionId = (string) ($session['id'] ?? '');

            if ($sessionId !== '') {
                $this->terminateSession($sessionId);
            }
        }
    }

    public function terminateByUsername(string $username): void
    {
        foreach ($this->getSessionsByPartialUsername($username) as $session) {
            $sessionId = (string) ($session['id'] ?? '');

            if ($sessionId !== '' && (string) ($session['username'] ?? '') === $username) {
                $this->terminateSession($sessionId);
            }
        }
    }

    private function getSessionsByPartialUsername(string $username): array
    {
        $needle = $this->sanitizeCliToken($username);

        if ($needle === '') {
            return [];
        }

        $output = $this->runCommand("psp {$needle}");
        return $output === null ? [] : $this->parseSessions($output);
    }

    private function runCommand(string $command): ?string
    {
        if ($this->password === '') {
            Log::warning('Coturn CLI password is empty.');
            return null;
        }

        $socket = @stream_socket_client(
            "tcp://{$this->host}:{$this->port}",
            $errno,
            $errstr,
            $this->timeout
        );

        if (! is_resource($socket)) {
            Log::error('Coturn CLI unreachable', [
                'host' => $this->host,
                'port' => $this->port,
                'error' => "{$errno}: {$errstr}",
            ]);
            return null;
        }

        stream_set_timeout($socket, $this->timeout);

        $this->readUntilContains($socket, 'Enter password:');
        fwrite($socket, $this->password . PHP_EOL);
        $this->readUntilPrompt($socket);

        fwrite($socket, $command . PHP_EOL);
        $output = $this->readUntilPrompt($socket);

        fwrite($socket, "q" . PHP_EOL);
        fclose($socket);

        return $output;
    }

    private function readUntilContains($socket, string $needle): string
    {
        $buffer = '';
        $deadline = microtime(true) + $this->timeout;

        while (microtime(true) < $deadline && is_resource($socket) && ! feof($socket)) {
            $chunk = fread($socket, 2048);

            if ($chunk === false) {
                break;
            }

            if ($chunk === '') {
                usleep(50_000);
                continue;
            }

            $buffer .= $chunk;

            if (str_contains($buffer, $needle)) {
                break;
            }
        }

        return $buffer;
    }

    private function readUntilPrompt($socket): string
    {
        $buffer = '';
        $deadline = microtime(true) + $this->timeout;

        while (microtime(true) < $deadline && is_resource($socket) && ! feof($socket)) {
            $chunk = fread($socket, 2048);

            if ($chunk === false) {
                break;
            }

            if ($chunk === '') {
                usleep(50_000);
                continue;
            }

            $buffer .= $chunk;

            if (str_contains($buffer, "\n> ") || str_ends_with($buffer, '> ')) {
                break;
            }
        }

        return $buffer;
    }

    private function parseSessions(string $output): array
    {
        $sessions = [];

        foreach (preg_split('/\R/', $output) as $line) {
            if (! preg_match('/id=([a-zA-Z0-9]+)/', $line, $idMatch)) {
                continue;
            }

            $sessionId = $idMatch[1];
            $username = null;

            if (preg_match('/user\s+<([^>]+)>/i', $line, $usernameMatch)) {
                $username = $usernameMatch[1];
            }

            $sessions[$sessionId] = [
                'id' => $sessionId,
                'username' => $username,
            ];
        }

        return array_values($sessions);
    }

    private function sanitizeCliToken(string $value): string
    {
        return preg_replace('/[^a-zA-Z0-9:_@.\-]/', '', $value) ?? '';
    }
}
