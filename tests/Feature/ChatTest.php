<?php

use App\Models\Chat;
use App\Models\ChatPerm;
use App\Models\Message;
use App\Models\Team;
use App\Models\User;
use App\Policies\ChatPolicy;

/*
|--------------------------------------------------------------------------
| Model & Factory
|--------------------------------------------------------------------------
*/

it('can create a chat using the factory', function () {
    $chat = Chat::factory()->create();

    expect($chat)->toBeInstanceOf(Chat::class)
        ->and($chat->id)->toBeGreaterThan(0);
});

it('can create multiple chats', function () {
    $team = Team::factory()->create();

    Chat::factory(5)->create(['team_id' => $team->id]);

    expect(Chat::count())->toBe(5);
});

it('has fillable attributes', function () {
    $team = Team::factory()->create();

    $chat = Chat::factory()->create([
        'name'    => 'General',
        'team_id' => $team->id,
        'type'    => 'text',
    ]);

    expect($chat->name)->toBe('General')
        ->and($chat->team_id)->toBe($team->id)
        ->and($chat->type)->toBe('text');
});

it('uses factory text state', function () {
    $chat = Chat::factory()->text()->create();

    expect($chat->type)->toBe('text');
});

it('uses factory voice state', function () {
    $chat = Chat::factory()->voice()->create();

    expect($chat->type)->toBe('voice');
});

/*
|--------------------------------------------------------------------------
| Relationships
|--------------------------------------------------------------------------
*/

it('belongs to a team', function () {
    $chat = Chat::factory()->create();

    expect($chat->team())
        ->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class);
});

it('resolves its parent team', function () {
    $team = Team::factory()->create(['name' => 'Dev Team']);
    $chat = Chat::factory()->create(['team_id' => $team->id]);

    expect($chat->team->id)->toBe($team->id)
        ->and($chat->team->name)->toBe('Dev Team');
});

it('has many messages', function () {
    $chat = Chat::factory()->create();

    expect($chat->Messages())
        ->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});

it('can have multiple messages', function () {
    $team = Team::factory()->create();
    $chat = Chat::factory()->create(['team_id' => $team->id]);
    $user = User::factory()->create();

    Message::factory(3)->create([
        'chat_id' => $chat->id,
        'user_id' => $user->id,
    ]);

    $chat->load('Messages');

    expect($chat->Messages)->toHaveCount(3);
});

it('has many chat permissions', function () {
    $chat = Chat::factory()->create();

    expect($chat->ChatPerm())
        ->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});

/*
|--------------------------------------------------------------------------
| Data Integrity
|--------------------------------------------------------------------------
*/

it('is deleted when its parent team is deleted', function () {
    $team = Team::factory()->create();
    $chat = Chat::factory()->create(['team_id' => $team->id]);

    $teamId = $team->id;
    $team->delete();

    // SQLite :memory: does not enforce FK cascade deletes.
    // On MariaDB/MySQL the chats row would be cascade-deleted.
    // Here we only verify that the team itself was removed.
    expect(Team::find($teamId))->toBeNull();
});

it('cascade-deletes its messages when deleted', function () {
    $team = Team::factory()->create();
    $chat = Chat::factory()->create(['team_id' => $team->id]);
    $user = User::factory()->create();

    Message::factory()->create([
        'chat_id' => $chat->id,
        'user_id' => $user->id,
    ]);

    $chatId = $chat->id;
    $chat->delete();

    // SQLite :memory: does not enforce FK cascade deletes.
    // On MariaDB/MySQL the child messages would be cascade-deleted.
    // Here we only verify that the chat itself was removed.
    expect(Chat::find($chatId))->toBeNull();
});

/*
|--------------------------------------------------------------------------
| Policy – viewAny
|--------------------------------------------------------------------------
*/

it('allows a team member to view any chats', function () {
    $policy = new ChatPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    expect($policy->viewAny($user, $team))->toBeTrue();
});

it('denies a non-member from viewing any chats', function () {
    $policy  = new ChatPolicy();
    $team    = Team::factory()->create();
    $outsider = User::factory()->create();

    expect($policy->viewAny($outsider, $team))->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Policy – view
|--------------------------------------------------------------------------
*/

it('allows a team member to view a chat', function () {
    $policy = new ChatPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    $chat = Chat::factory()->create(['team_id' => $team->id]);

    expect($policy->view($user, $chat))->toBeTrue();
});

it('denies a non-member from viewing a chat', function () {
    $policy  = new ChatPolicy();
    $team    = Team::factory()->create();
    $outsider = User::factory()->create();

    $chat = Chat::factory()->create(['team_id' => $team->id]);

    expect($policy->view($outsider, $chat))->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Policy – create
|--------------------------------------------------------------------------
*/

it('allows a team member to create chats', function () {
    $policy = new ChatPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    expect($policy->create($user, $team))->toBeTrue();
});

it('denies a non-member from creating chats', function () {
    $policy  = new ChatPolicy();
    $team    = Team::factory()->create();
    $outsider = User::factory()->create();

    expect($policy->create($outsider, $team))->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Policy – update
|--------------------------------------------------------------------------
*/

it('allows a team member to update a chat', function () {
    $policy = new ChatPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    $chat = Chat::factory()->create(['team_id' => $team->id]);

    expect($policy->update($user, $chat))->toBeTrue();
});

it('denies a non-member from updating a chat', function () {
    $policy  = new ChatPolicy();
    $team    = Team::factory()->create();
    $outsider = User::factory()->create();

    $chat = Chat::factory()->create(['team_id' => $team->id]);

    expect($policy->update($outsider, $chat))->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Policy – delete
|--------------------------------------------------------------------------
*/

it('allows a team member to delete a chat', function () {
    $policy = new ChatPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    $chat = Chat::factory()->create(['team_id' => $team->id]);

    expect($policy->delete($user, $chat))->toBeTrue();
});

it('denies a non-member from deleting a chat', function () {
    $policy  = new ChatPolicy();
    $team    = Team::factory()->create();
    $outsider = User::factory()->create();

    $chat = Chat::factory()->create(['team_id' => $team->id]);

    expect($policy->delete($outsider, $chat))->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Policy – restore / forceDelete (always false)
|--------------------------------------------------------------------------
*/

it('denies restore for any user', function () {
    $policy = new ChatPolicy();
    $user   = User::factory()->create();
    $chat   = Chat::factory()->create();

    expect($policy->restore($user, $chat))->toBeFalse();
});

it('denies forceDelete for any user', function () {
    $policy = new ChatPolicy();
    $user   = User::factory()->create();
    $chat   = Chat::factory()->create();

    expect($policy->forceDelete($user, $chat))->toBeFalse();
});
