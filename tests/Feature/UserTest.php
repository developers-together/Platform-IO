<?php

use App\Models\User;
use App\Models\Team;
use App\Models\Contact;

/*
|--------------------------------------------------------------------------
| Model & Factory
|--------------------------------------------------------------------------
*/

it('can create a user using the factory', function () {
    $user = User::factory()->create();

    expect($user)->toBeInstanceOf(User::class)
        ->and($user->id)->toBeGreaterThan(0);
});

it('can create multiple users', function () {
    User::factory(5)->create();

    expect(User::count())->toBe(5);
});

it('has fillable attributes', function () {
    $user = User::factory()->create([
        'name'     => 'John Doe',
        'email'    => 'john@example.com',
        'job'      => 'Developer',
        'phone'    => '1234567890',
        'gender'   => 'Male',
        'timezone' => 'Africa/Cairo',
    ]);

    expect($user->name)->toBe('John Doe')
        ->and($user->email)->toBe('john@example.com')
        ->and($user->job)->toBe('Developer')
        ->and($user->phone)->toBe('1234567890')
        ->and($user->gender)->toBe('Male')
        ->and($user->timezone)->toBe('Africa/Cairo');
});

it('hashes the password automatically', function () {
    $user = User::factory()->create(['password' => 'secret123']);

    expect($user->password)->not->toBe('secret123');
});

it('hides password and remember_token from serialization', function () {
    $user = User::factory()->create();
    $array = $user->toArray();

    expect($array)->not->toHaveKey('password')
        ->and($array)->not->toHaveKey('remember_token');
});

/*
|--------------------------------------------------------------------------
| Relationships
|--------------------------------------------------------------------------
*/

it('belongs to many teams', function () {
    $user = User::factory()->create();

    expect($user->teams())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsToMany::class);
});

it('can be attached to teams with roles', function () {
    $user  = User::factory()->create();
    $teams = Team::factory(2)->create();

    $user->teams()->attach($teams[0]->id, ['role' => 'owner', 'profile' => '']);
    $user->teams()->attach($teams[1]->id, ['role' => 'member', 'profile' => '']);

    $user->load('teams');

    expect($user->teams)->toHaveCount(2);

    $roles = $user->teams->pluck('pivot.role')->sort()->values()->all();
    expect($roles)->toBe(['member', 'owner']);
});

it('has many contacts', function () {
    $user = User::factory()->create();

    expect($user->contacts())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});

it('has many messages', function () {
    $user = User::factory()->create();

    expect($user->messages())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});

it('has many chats', function () {
    $user = User::factory()->create();

    expect($user->chats())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});

/*
|--------------------------------------------------------------------------
| Data Integrity
|--------------------------------------------------------------------------
*/

it('enforces unique email', function () {
    User::factory()->create(['email' => 'dupe@example.com']);

    expect(fn () => User::factory()->create(['email' => 'dupe@example.com']))
        ->toThrow(\Illuminate\Database\QueryException::class);
});

it('enforces unique phone', function () {
    User::factory()->create(['phone' => '5551234567']);

    expect(fn () => User::factory()->create(['phone' => '5551234567']))
        ->toThrow(\Illuminate\Database\QueryException::class);
});

it('cascades user deletion from team pivot', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);
    expect($team->users)->toHaveCount(1);

    $user->delete();
    $team->load('users');

    expect($team->users)->toHaveCount(0);
});
