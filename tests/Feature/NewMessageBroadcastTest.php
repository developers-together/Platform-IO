<?php

use App\Events\NewMessage;
use App\Models\Chat;
use App\Models\ChatPerm;
use App\Models\Message;
use App\Models\Team;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Support\Facades\Event;

/*
|--------------------------------------------------------------------------
| Event – broadcastOn
|--------------------------------------------------------------------------
*/

it('broadcasts on the correct private channel', function () {
    $team    = Team::factory()->create();
    $chat    = Chat::factory()->create(['team_id' => $team->id]);
    $user    = User::factory()->create();
    $message = Message::factory()->create([
        'chat_id' => $chat->id,
        'user_id' => $user->id,
    ]);

    $event    = new NewMessage($message);
    $channels = $event->broadcastOn();

    expect($channels)->toHaveCount(1)
        ->and($channels[0])->toBeInstanceOf(PrivateChannel::class)
        ->and($channels[0]->name)->toBe('private-team.' . $team->id . '.chat.' . $chat->id . '.get');
});

/*
|--------------------------------------------------------------------------
| Event – broadcastWith
|--------------------------------------------------------------------------
*/

it('includes message data in broadcastWith', function () {
    $team    = Team::factory()->create();
    $chat    = Chat::factory()->create(['team_id' => $team->id]);
    $user    = User::factory()->create();
    $message = Message::factory()->create([
        'chat_id' => $chat->id,
        'user_id' => $user->id,
        'message' => 'Hello team!',
        'path'    => null,
    ]);

    $event = new NewMessage($message);
    $data  = $event->broadcastWith();

    expect($data['message'])->toBe('Hello team!')
        ->and($data['chat_id'])->toBe($chat->id)
        ->and($data['user_id'])->toBe($user->id);
});

it('converts path to storage URL in broadcastWith when path exists', function () {
    $team    = Team::factory()->create();
    $chat    = Chat::factory()->create(['team_id' => $team->id]);
    $user    = User::factory()->create();
    $message = Message::factory()->create([
        'chat_id' => $chat->id,
        'user_id' => $user->id,
        'path'    => 'images/photo.jpg',
    ]);

    $event = new NewMessage($message);
    $data  = $event->broadcastWith();

    // Storage::url() prepends the storage URL prefix
    expect($data['path'])->toContain('images/photo.jpg')
        ->and($data['path'])->not->toBe('images/photo.jpg');
});

it('keeps path null in broadcastWith when no attachment', function () {
    $team    = Team::factory()->create();
    $chat    = Chat::factory()->create(['team_id' => $team->id]);
    $user    = User::factory()->create();
    $message = Message::factory()->create([
        'chat_id' => $chat->id,
        'user_id' => $user->id,
        'path'    => null,
    ]);

    $event = new NewMessage($message);
    $data  = $event->broadcastWith();

    expect($data['path'])->toBeNull();
});

/*
|--------------------------------------------------------------------------
| Event – dispatching
|--------------------------------------------------------------------------
*/

it('implements ShouldBroadcast', function () {
    $message = Message::factory()->create();
    $event   = new NewMessage($message);

    expect($event)->toBeInstanceOf(\Illuminate\Contracts\Broadcasting\ShouldBroadcast::class);
});

it('can be dispatched as an event', function () {
    Event::fake([NewMessage::class]);

    $message = Message::factory()->create();

    event(new NewMessage($message));

    Event::assertDispatched(NewMessage::class, function ($event) use ($message) {
        return $event->message->id === $message->id;
    });
});

/*
|--------------------------------------------------------------------------
| Channel Authorization
|--------------------------------------------------------------------------
*/

it('authorizes a team member on the chat channel', function () {
    $team = Team::factory()->create();
    $chat = Chat::factory()->create(['team_id' => $team->id]);
    $user = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    ChatPerm::create([
        'chat_id' => $chat->id, 'write' => true, 'read' => true,
        'delete' => false, 'modify' => false, 'notify' => true, 'allow_ai' => false,
    ]);

    // Replicate the channel callback logic from channels.php
    $pivot = $chat->team->users()->wherePivot('user_id', $user->id)->first()?->pivot;
    $perm  = $chat->ChatPerm->first();
    $authorized = ($pivot && in_array($pivot->role, ['admin', 'owner']))
                  || ($pivot && $perm && $perm->read == true);

    expect($authorized)->toBeTrue();
});

it('rejects a non-member from the chat channel', function () {
    $team    = Team::factory()->create();
    $chat    = Chat::factory()->create(['team_id' => $team->id]);
    $outsider = User::factory()->create();

    ChatPerm::create([
        'chat_id' => $chat->id, 'write' => true, 'read' => true,
        'delete' => false, 'modify' => false, 'notify' => true, 'allow_ai' => false,
    ]);

    // Replicate the channel callback logic from channels.php
    $pivot = $chat->team->users()->wherePivot('user_id', $outsider->id)->first()?->pivot;
    $perm  = $chat->ChatPerm->first();
    $authorized = ($pivot && in_array($pivot->role, ['admin', 'owner']))
                  || ($pivot && $perm && $perm->read == true);

    expect($authorized)->toBeFalse();
});

it('authorizes an admin even if ChatPerm read is false', function () {
    $team  = Team::factory()->create();
    $chat  = Chat::factory()->create(['team_id' => $team->id]);
    $admin = User::factory()->create();

    $team->users()->attach($admin->id, ['role' => 'admin', 'profile' => '']);

    ChatPerm::create([
        'chat_id' => $chat->id, 'write' => false, 'read' => false,
        'delete' => false, 'modify' => false, 'notify' => false, 'allow_ai' => false,
    ]);

    $pivot = $chat->team->users()->wherePivot('user_id', $admin->id)->first()?->pivot;
    $perm  = $chat->ChatPerm->first();
    $authorized = ($pivot && in_array($pivot->role, ['admin', 'owner']))
                  || ($pivot && $perm && $perm->read == true);

    expect($authorized)->toBeTrue();
});

it('rejects a member when ChatPerm read is false', function () {
    $team   = Team::factory()->create();
    $chat   = Chat::factory()->create(['team_id' => $team->id]);
    $member = User::factory()->create();

    $team->users()->attach($member->id, ['role' => 'member', 'profile' => '']);

    ChatPerm::create([
        'chat_id' => $chat->id, 'write' => true, 'read' => false,
        'delete' => false, 'modify' => false, 'notify' => true, 'allow_ai' => false,
    ]);

    $pivot = $chat->team->users()->wherePivot('user_id', $member->id)->first()?->pivot;
    $perm  = $chat->ChatPerm->first();
    $authorized = ($pivot && in_array($pivot->role, ['admin', 'owner']))
                  || ($pivot && $perm && $perm->read == true);

    expect($authorized)->toBeFalse();
});

