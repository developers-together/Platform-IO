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
    $teamId = escapeshellarg($team->id);
    $directory = "/home/ftpusers/teams/$teamId"; 

    Log::info('Directory path set', ['directory' => $directory]);

    // Function to run commands safely and log output
    $runCommand = function ($command) {
        $process = Process::fromShellCommandline($command);
        $process->run();
        
        if (!$process->isSuccessful()) {
            Log::error("Command failed", ['command' => $command, 'error' => $process->getErrorOutput()]);
            throw new ProcessFailedException($process);
        }
        
        Log::info("Command executed successfully", ['command' => $command, 'output' => $process->getOutput()]);
    };

    // Ensure team directory exists
    if (!file_exists($directory)) {
        Log::info('Creating team directory', ['directory' => $directory]);
        $runCommand("sudo mkdir -p $directory");
        $runCommand("sudo chown -R root:ftp $directory");
    }

    // Create FTP user
    Log::info('Creating FTP user', ['username' => $validated['username']]);
    $runCommand("sudo useradd -m -d $directory -s /usr/sbin/nologin $username");

    // Set user password
    $runCommand("echo \"$username:$password\" | sudo chpasswd");

    // Set permissions based on role
    if ($role === 'leader' || $role === 'member') {
        Log::info('Setting directory permissions: 770');
        $runCommand("sudo chmod 770 $directory");
    } elseif ($role === 'viewer') {
        Log::info('Setting directory permissions: 750');
        $runCommand("sudo chmod 750 $directory");
    }

    // Add user to FTP group
    Log::info('Adding user to FTP group');
    $runCommand("sudo usermod -aG ftp $username");

    Log::info('FTP user created successfully');

    return response()->json([
        'message' => 'FTP user created successfully!',
        'username' => $validated['username'],
        'team_id' => $team->id,
        'role' => $role,
    ], 201);
    }
}
