<?php

namespace App\Http\Controllers;

use App\Services\TurnService;
use RuntimeException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TurnCredentialController extends Controller
{
    public function __construct(private TurnService $turn) {}

    // Issue fresh TURN credentials to the authenticated user
    public function issue(Request $request): JsonResponse
    {
        $request->validate([
            'room_id' => ['nullable', 'string', 'max:255'],
        ]);

        

        try {
            $credentials = $this->turn->generateCredentials(
                userId: (int) $request->user()->id,
                roomId: $request->input('room_id'),
            );
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 503);
        }

        return response()->json($credentials);
    }

    // Explicitly terminate the caller's TURN sessions
    public function terminate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['nullable', 'string', 'max:255'],
        ]);

        $userId = (int) $request->user()->id;
        $username = $data['username'] ?? null;

        if (is_string($username) && $username !== '') {
            $terminated = $this->turn->terminateSessionForUser($userId, $username);

            return response()->json([
                'message' => $terminated ? 'Session terminated.' : 'No active session found for this username.',
            ], $terminated ? 200 : 404);
        }

        $this->turn->terminateUserSessions($userId);

        return response()->json(['message' => 'Sessions terminated.']);
    }
}
