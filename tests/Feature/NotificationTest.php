<?php

use App\Models\Chat;
use App\Models\ChatPerm;
use App\Models\Message;
use App\Models\Team;
use App\Models\User;
use App\Notifications\NewChatMessage;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Notification;

/*
|--------------------------------------------------------------------------
| NewChatMessage Notification – Structure
|--------------------------------------------------------------------------
*/

it('can be instantiated with a message', function () {
    $message      = Message::factory()->create();
    $notification = new NewChatMessage($message);

    expect($notification->message->id)->toBe($message->id);
});

it('delivers via database and broadcast channels', function () {
    $message      = Message::factory()->create();
    $notification = new NewChatMessage($message);
    $user         = User::factory()->create();

    $channels = $notification->via($user);

    expect($channels)->toContain('database')
        ->and($channels)->toContain('broadcast');
});

it('returns correct data in toArray', function () {
    $team    = Team::factory()->create();
    $chat    = Chat::factory()->create(['team_id' => $team->id, 'name' => 'General']);
    $sender  = User::factory()->create(['name' => 'Alice']);
    $message = Message::factory()->create([
        'chat_id' => $chat->id,
        'user_id' => $sender->id,
        'message' => 'Hello everyone in the team!',
    ]);

    $notification = new NewChatMessage($message);
    $data         = $notification->toArray($sender);

    expect($data['message_id'])->toBe($message->id)
        ->and($data['chat_id'])->toBe($chat->id)
        ->and($data['chat_name'])->toBe('General')
        ->and($data['user'])->toBe('Alice')
        ->and((string) $data['preview'])->toContain('Hello everyone');
});

it('truncates long messages in preview', function () {
    $message = Message::factory()->create([
        'message' => str_repeat('A', 200),
    ]);

    $notification = new NewChatMessage($message);
    $data         = $notification->toArray(User::factory()->create());

    // str()->limit(50) truncates to 50 chars + "..."
    expect(strlen((string) $data['preview']))->toBeLessThanOrEqual(53);
});

/*
|--------------------------------------------------------------------------
| NewChatMessage Notification – Sending
|--------------------------------------------------------------------------
*/

it('sends notification to team members', function () {
    Notification::fake();

    $team   = Team::factory()->create();
    $chat   = Chat::factory()->create(['team_id' => $team->id]);
    $sender = User::factory()->create();
    $member = User::factory()->create();

    $team->users()->attach($sender->id, ['role' => 'member', 'profile' => '']);
    $team->users()->attach($member->id, ['role' => 'member', 'profile' => '']);

    $message = Message::factory()->create([
        'chat_id' => $chat->id,
        'user_id' => $sender->id,
    ]);

    // Simulate what the controller does: notify all team members except sender
    $usersToNotify = $chat->team->users()
        ->where('user_id', '!=', $sender->id)
        ->get();

    foreach ($usersToNotify as $teamMember) {
        $teamMember->notify(new NewChatMessage($message));
    }

    Notification::assertSentTo($member, NewChatMessage::class);
    Notification::assertNotSentTo($sender, NewChatMessage::class);
});

it('does not notify non-team members', function () {
    Notification::fake();

    $team    = Team::factory()->create();
    $chat    = Chat::factory()->create(['team_id' => $team->id]);
    $sender  = User::factory()->create();
    $outsider = User::factory()->create();

    $team->users()->attach($sender->id, ['role' => 'member', 'profile' => '']);

    $message = Message::factory()->create([
        'chat_id' => $chat->id,
        'user_id' => $sender->id,
    ]);

    $usersToNotify = $chat->team->users()
        ->where('user_id', '!=', $sender->id)
        ->get();

    foreach ($usersToNotify as $teamMember) {
        $teamMember->notify(new NewChatMessage($message));
    }

    Notification::assertNotSentTo($outsider, NewChatMessage::class);
});

it('notifies multiple team members but not the sender', function () {
    Notification::fake();

    $team    = Team::factory()->create();
    $chat    = Chat::factory()->create(['team_id' => $team->id]);
    $sender  = User::factory()->create();
    $member1 = User::factory()->create();
    $member2 = User::factory()->create();

    $team->users()->attach($sender->id, ['role' => 'member', 'profile' => '']);
    $team->users()->attach($member1->id, ['role' => 'member', 'profile' => '']);
    $team->users()->attach($member2->id, ['role' => 'admin', 'profile' => '']);

    $message = Message::factory()->create([
        'chat_id' => $chat->id,
        'user_id' => $sender->id,
    ]);

    $usersToNotify = $chat->team->users()
        ->where('user_id', '!=', $sender->id)
        ->get();

    foreach ($usersToNotify as $teamMember) {
        $teamMember->notify(new NewChatMessage($message));
    }

    Notification::assertSentTo($member1, NewChatMessage::class);
    Notification::assertSentTo($member2, NewChatMessage::class);
    Notification::assertNotSentTo($sender, NewChatMessage::class);
});

/*
|--------------------------------------------------------------------------
| Notify Permission – ChatPerm flag
|--------------------------------------------------------------------------
*/

it('respects ChatPerm notify flag being true', function () {
    $team = Team::factory()->create();
    $chat = Chat::factory()->create(['team_id' => $team->id]);

    ChatPerm::create([
        'chat_id' => $chat->id, 'write' => true, 'read' => true,
        'delete' => false, 'modify' => false, 'notify' => true, 'allow_ai' => false,
    ]);

    $perm = $chat->ChatPerm->first();

    expect($perm->notify)->toBeTrue();
});

it('respects ChatPerm notify flag being false', function () {
    $team = Team::factory()->create();
    $chat = Chat::factory()->create(['team_id' => $team->id]);

    ChatPerm::create([
        'chat_id' => $chat->id, 'write' => true, 'read' => true,
        'delete' => false, 'modify' => false, 'notify' => false, 'allow_ai' => false,
    ]);

    $perm = $chat->ChatPerm->first();

    expect($perm->notify)->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Database Notification – Persistence
|--------------------------------------------------------------------------
*/

it('stores notification in the database', function () {
    $team   = Team::factory()->create();
    $chat   = Chat::factory()->create(['team_id' => $team->id]);
    $sender = User::factory()->create();
    $member = User::factory()->create();

    $team->users()->attach($sender->id, ['role' => 'member', 'profile' => '']);
    $team->users()->attach($member->id, ['role' => 'member', 'profile' => '']);

    $message = Message::factory()->create([
        'chat_id' => $chat->id,
        'user_id' => $sender->id,
        'message' => 'Test notification',
    ]);

    // Send a real notification (not faked) to test DB persistence
    $member->notify(new NewChatMessage($message));

    expect($member->notifications)->toHaveCount(1)
        ->and($member->notifications->first()->data['chat_id'])->toBe($chat->id)
        ->and($member->notifications->first()->data['message_id'])->toBe($message->id);
});

it('can be marked as read', function () {
    $member  = User::factory()->create();
    $message = Message::factory()->create();

    $member->notify(new NewChatMessage($message));

    expect($member->unreadNotifications)->toHaveCount(1);

    $member->unreadNotifications->markAsRead();
    $member->refresh();

    expect($member->unreadNotifications)->toHaveCount(0)
        ->and($member->notifications)->toHaveCount(1);
});
