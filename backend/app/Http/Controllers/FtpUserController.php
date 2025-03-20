<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class FtpUserController extends Controller
{
    public function createFtpUser(Team $team, Request $request)
{
    Log::info('createFtpUser API called', ['team_id' => $team->id ?? 'N/A']);

    // Validate request data
    try {
        $validated = $request->validate([
            'username' => 'string|required',
            'password' => 'required'
        ]);
        Log::info('Request validated', ['username' => $validated['username']]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::error('Validation failed', ['errors' => $e->errors()]);
        return response()->json(['error' => 'Validation failed', 'details' => $e->errors()], 422);
    }

    // Get the authenticated user
    $user = Auth::user();
    if (!$user) {
        Log::error('Unauthorized access attempt');
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    Log::info('Authenticated user', ['user_id' => $user->id]);

    // Check if the user is part of the team
    $teamUser = $team->users()->where('user_id', $user->id)->first();
    if (!$teamUser) {
        Log::warning('User is not a member of the team', ['user_id' => $user->id, 'team_id' => $team->id]);
        return response()->json(['error' => 'You are not a member of this team'], 403);
    }
    Log::info('User is part of the team');

    // Get role from pivot table
    $role = $teamUser->pivot->role;
    Log::info('User role determined', ['role' => $role]);

    // Set username and directory
    $username = escapeshellarg($validated['username']);
    $password = escapeshellarg($validated['password']);
    $teamId   = escapeshellarg($team->id);
    $directory = "/home/ftpusers/teams/$teamId";

    Log::info('Directory path set', ['directory' => $directory]);

    // Ensure team directory exists
    if (!file_exists($directory)) {
        Log::info('Creating team directory', ['directory' => $directory]);
        $this->runCommand(['sudo', 'mkdir', '-p', $directory]);
        $this->runCommand(['sudo', 'chown', '-R', 'root:ftp', $directory]);
    }

    // Check if user already exists
    $checkUser = $this->runCommand(['id', '-u', $validated['username']], false);
    if ($checkUser['exitCode'] === 0) {
        Log::warning('User already exists', ['username' => $validated['username']]);
        return response()->json(['error' => 'User already exists'], 409);
    }

    // Create FTP user
    Log::info('Creating FTP user', ['username' => $validated['username']]);
    $createUser = $this->runCommand(['sudo', 'useradd', '-m', '-d', $directory, '-s', '/usr/sbin/nologin', $validated['username']]);
    if ($createUser['exitCode'] !== 0) {
        return response()->json(['error' => 'Failed to create user', 'details' => $createUser['error']], 500);
    }

    // Securely set user password
    $changePassword = $this->runCommand(['sudo', 'chpasswd'], true, "{$validated['username']}:{$validated['password']}");
    if ($changePassword['exitCode'] !== 0) {
        return response()->json(['error' => 'Failed to set password', 'details' => $changePassword['error']], 500);
    }
    Log::info('Password set for FTP user');

    // Set permissions based on role
    $permission = ($role === 'leader' || $role === 'member') ? '770' : '750';
    Log::info('Setting directory permissions', ['permissions' => $permission]);
    $this->runCommand(['sudo', 'chmod', $permission, $directory]);

    // Add user to FTP group
    Log::info('Adding user to FTP group');
    $this->runCommand(['sudo', 'usermod', '-aG', 'ftpusers', $validated['username']]);

    Log::info('FTP user created successfully');

    return response()->json([
        'message' => 'FTP user created successfully!',
        'username' => $validated['username'],
        'team_id' => $team->id,
        'role' => $role,
    ], 201);
}

/**
 * Runs a shell command securely using Symfony Process.
 *
 * @param array $command The command to run as an array.
 * @param bool $useInput Whether to pass input to the command.
 * @param string|null $input The input string (if needed).
 * @return array Contains 'output', 'error', and 'exitCode'.
 */
private function runCommand(array $command, bool $useInput = false, string $input = null): array
{
    $process = new Process($command);
    if ($useInput && $input) {
        $process->setInput($input);
    }
    $process->run();

    // Log the output and error
    Log::info('Command executed', [
        'command' => implode(' ', $command),
        'output' => $process->getOutput(),
        'error' => $process->getErrorOutput(),
        'exitCode' => $process->getExitCode(),
    ]);

    return [
        'output' => trim($process->getOutput()),
        'error' => trim($process->getErrorOutput()),
        'exitCode' => $process->getExitCode(),
    ];
}
}
