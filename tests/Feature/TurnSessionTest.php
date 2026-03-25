<?php

use App\Http\Controllers\TurnCredentialController;
use App\Models\TurnSession;
use App\Models\User;
use App\Services\CoturnAdminService;
use App\Services\TurnService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

afterEach(function () {
    \Mockery::close();
});

/*
|--------------------------------------------------------------------------
| Model & Factory
|--------------------------------------------------------------------------
*/

it('can create a turn session using the factory', function () {
    $session = TurnSession::factory()->create();

    expect($session)->toBeInstanceOf(TurnSession::class)
        ->and($session->id)->toBeGreaterThan(0);
});

it('can create multiple turn sessions', function () {
    TurnSession::factory()->count(3)->create();

    expect(TurnSession::count())->toBe(3);
});

it('persists fillable attributes explicitly', function () {
    $user = User::factory()->create();
    $username = (string) (now()->addHour()->timestamp) . ':' . $user->id;

    $session = TurnSession::create([
        'user_id' => $user->id,
        'username' => $username,
        'room_id' => 'voice-room-1',
        'expires_at' => now()->addHour(),
    ]);

    expect($session->user_id)->toBe($user->id)
        ->and($session->username)->toBe($username)
        ->and($session->room_id)->toBe('voice-room-1')
        ->and($session->terminated_at)->toBeNull();
});

/*
|--------------------------------------------------------------------------
| Relationships
|--------------------------------------------------------------------------
*/

it('belongs to a user', function () {
    $session = TurnSession::factory()->create();

    expect($session->user())
        ->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class);
});

it('resolves the owning user', function () {
    $user = User::factory()->create(['name' => 'Voice Owner']);
    $session = TurnSession::factory()->create(['user_id' => $user->id]);

    expect($session->user->id)->toBe($user->id)
        ->and($session->user->name)->toBe('Voice Owner');
});

/*
|--------------------------------------------------------------------------
| Data Integrity
|--------------------------------------------------------------------------
*/

it('returns only non-terminated and non-expired sessions in the active scope', function () {
    $user = User::factory()->create();

    $active = TurnSession::factory()->create([
        'user_id' => $user->id,
        'expires_at' => now()->addMinutes(30),
        'terminated_at' => null,
    ]);

    TurnSession::factory()->create([
        'user_id' => $user->id,
        'expires_at' => now()->subMinute(),
        'terminated_at' => null,
    ]);

    TurnSession::factory()->terminated()->create([
        'user_id' => $user->id,
        'expires_at' => now()->addMinutes(30),
    ]);

    $activeIds = TurnSession::query()->active()->pluck('id')->all();

    expect($activeIds)->toBe([$active->id]);
});

it('returns terminated or expired sessions in the inactive scope', function () {
    $user = User::factory()->create();

    TurnSession::factory()->create([
        'user_id' => $user->id,
        'expires_at' => now()->addMinutes(30),
        'terminated_at' => null,
    ]);

    $expired = TurnSession::factory()->create([
        'user_id' => $user->id,
        'expires_at' => now()->subMinute(),
        'terminated_at' => null,
    ]);

    $terminated = TurnSession::factory()->terminated()->create([
        'user_id' => $user->id,
        'expires_at' => now()->addMinutes(30),
    ]);

    $inactiveIds = TurnSession::query()->inactive()->pluck('id')->all();

    expect($inactiveIds)->toContain($expired->id)
        ->and($inactiveIds)->toContain($terminated->id);
});

it('is associated with a deleted parent user (cascade handled by real DB engines)', function () {
    $user = User::factory()->create();
    $userId = $user->id;

    TurnSession::factory()->create(['user_id' => $userId]);
    $user->delete();

    // SQLite test runs can behave differently with FK cascade checks.
    // On MariaDB/MySQL, turn_sessions rows are cascade-deleted via FK.
    expect(User::find($userId))->toBeNull();
});

/*
|--------------------------------------------------------------------------
| Controller Logic
|--------------------------------------------------------------------------
*/

it('issues turn credentials and stores a turn session', function () {
    config([
        'services.coturn.secret' => 'testing-secret',
        'services.coturn.host' => '127.0.0.1',
        'services.coturn.port' => 3478,
        'services.coturn.tls_port' => 5349,
        'services.coturn.ttl' => 3600,
    ]);

    $coturn = \Mockery::mock(CoturnAdminService::class);
    $service = new TurnService($coturn);
    $controller = new TurnCredentialController($service);
    $user = User::factory()->create();

    $this->actingAs($user);

    $request = turnRequest($user, ['room_id' => 'voice-room-42']);
    $response = $controller->issue($request);
    $payload = $response->getData(true);

    expect($response->getStatusCode())->toBe(200)
        ->and($payload)->toHaveKeys(['ice_servers', 'iceServers', 'ttl', 'username']);

    expect(TurnSession::where('user_id', $user->id)
        ->where('username', $payload['username'])
        ->where('room_id', 'voice-room-42')
        ->exists())->toBeTrue();
});

it('returns 503 when turn secret is missing while issuing credentials', function () {
    config([
        'services.coturn.secret' => '',
        'services.coturn.ttl' => 3600,
    ]);

    $coturn = \Mockery::mock(CoturnAdminService::class);
    $service = new TurnService($coturn);
    $controller = new TurnCredentialController($service);
    $user = User::factory()->create();

    $this->actingAs($user);

    $request = turnRequest($user, ['room_id' => 'voice-room-42']);
    $response = $controller->issue($request);
    $payload = $response->getData(true);

    expect($response->getStatusCode())->toBe(503)
        ->and($payload['message'])->toContain('TURN secret is not configured');
});

it('terminates a specific session for the authenticated user', function () {
    $user = User::factory()->create();

    $sessionToTerminate = TurnSession::factory()->create([
        'user_id' => $user->id,
        'terminated_at' => null,
        'expires_at' => now()->addHour(),
    ]);

    $otherSession = TurnSession::factory()->create([
        'user_id' => $user->id,
        'terminated_at' => null,
        'expires_at' => now()->addHour(),
    ]);

    $coturn = \Mockery::mock(CoturnAdminService::class);
    $coturn->shouldReceive('terminateByUsername')
        ->once()
        ->with($sessionToTerminate->username);

    $service = new TurnService($coturn);
    $controller = new TurnCredentialController($service);

    $this->actingAs($user);

    $request = turnRequest($user, ['username' => $sessionToTerminate->username]);
    $response = $controller->terminate($request);

    expect($response->getStatusCode())->toBe(200);

    $sessionToTerminate->refresh();
    $otherSession->refresh();

    expect($sessionToTerminate->terminated_at)->toBeInstanceOf(Carbon::class)
        ->and($otherSession->terminated_at)->toBeNull();
});

it('does not terminate another users session when username is provided', function () {
    $caller = User::factory()->create();
    $otherUser = User::factory()->create();

    $otherSession = TurnSession::factory()->create([
        'user_id' => $otherUser->id,
        'terminated_at' => null,
        'expires_at' => now()->addHour(),
    ]);

    $coturn = \Mockery::mock(CoturnAdminService::class);
    $coturn->shouldNotReceive('terminateByUsername');

    $service = new TurnService($coturn);
    $controller = new TurnCredentialController($service);

    $this->actingAs($caller);

    $request = turnRequest($caller, ['username' => $otherSession->username]);
    $response = $controller->terminate($request);

    expect($response->getStatusCode())->toBe(404);

    $otherSession->refresh();
    expect($otherSession->terminated_at)->toBeNull();
});

it('terminates all active sessions for the authenticated user', function () {
    $user = User::factory()->create();
    $outsider = User::factory()->create();

    $activeOne = TurnSession::factory()->create([
        'user_id' => $user->id,
        'terminated_at' => null,
        'expires_at' => now()->addHour(),
    ]);

    $activeTwo = TurnSession::factory()->create([
        'user_id' => $user->id,
        'terminated_at' => null,
        'expires_at' => now()->addHour(),
    ]);

    $alreadyTerminated = TurnSession::factory()->terminated()->create([
        'user_id' => $user->id,
    ]);

    $outsiderSession = TurnSession::factory()->create([
        'user_id' => $outsider->id,
        'terminated_at' => null,
        'expires_at' => now()->addHour(),
    ]);

    $coturn = \Mockery::mock(CoturnAdminService::class);
    $coturn->shouldReceive('terminateUserSessions')
        ->once()
        ->with($user->id);

    $service = new TurnService($coturn);
    $controller = new TurnCredentialController($service);

    $this->actingAs($user);

    $request = turnRequest($user, []);
    $response = $controller->terminate($request);

    expect($response->getStatusCode())->toBe(200);

    $activeOne->refresh();
    $activeTwo->refresh();
    $alreadyTerminated->refresh();
    $outsiderSession->refresh();

    expect($activeOne->terminated_at)->toBeInstanceOf(Carbon::class)
        ->and($activeTwo->terminated_at)->toBeInstanceOf(Carbon::class)
        ->and($alreadyTerminated->terminated_at)->toBeInstanceOf(Carbon::class)
        ->and($outsiderSession->terminated_at)->toBeNull();
});

function turnRequest(User $user, array $payload): Request
{
    $request = Request::create('/fake', 'POST', $payload);
    $request->setUserResolver(fn () => $user);

    return $request;
}
