<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use phpseclib3\Crypt\PublicKeyLoader;
use phpseclib3\Net\SFTP;

use Illuminate\Http\Request;

class SftpController extends Controller
{
    public function connect(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('email', $credentials['email'])
            ->with('teams')
            ->first();

        if (!$user || !\Hash::check($credentials['password'], $user->password)) {
            abort(401, 'Invalid credentials');
        }

        $sftp = new SFTP(config('sftp.host'));
        if (!$sftp->login($user->email, $credentials['password'])) {
            abort(401, 'SFTP login failed');
        }

        return response()->json([
            'message' => 'SFTP connection established',
            'teams' => $user->teams->pluck('id'),
            'chroot_base' => '/'
        ]);
    }

    public function handleSftpCommand(Team $team, Request $request)
    {
        $user = auth()->user();
        
        if (!$user->teams->contains($team->id)) {
            abort(403, 'Unauthorized team access');
        }

        $sftp = new SFTP(config('sftp.host'));
        $sftp->login($user->sftp_username, $request->header('X-SFTP-Session'));

        $command = $request->input('command');
        $path = "{$team->id}/" . ltrim($request->input('path'), '/');

        switch ($command) {
            case 'list':
                return response()->json($sftp->nlist($path));
            case 'get':
                return response($sftp->get($path))
                    ->header('Content-Type', 'application/octet-stream');
            case 'put':
                $sftp->put($path, $request->file('content'));
                return response()->json(['status' => 'success']);
            default:
                abort(400, 'Invalid SFTP command');
        }
    }
}
