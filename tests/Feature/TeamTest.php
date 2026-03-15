<?php

use App\Models\Team;
use App\Models\User;

it('can create a team using the factory', function () {
    $team = Team::factory()->create();

    expect($team)->toBeInstanceOf(Team::class)
        ->and($team->id)->toBeGreaterThan(0);
});

it('can create multiple teams', function () {
    Team::factory(5)->create();

    expect(Team::count())->toBe(5);
});

it('has fillable attributes', function () {
    $team = Team::factory()->create([
        'name'         => 'Alpha Team',
        'description'  => 'The best team',
        'project_name' => 'Project X',
    ]);

    expect($team->name)->toBe('Alpha Team')
        ->and($team->description)->toBe('The best team')
        ->and($team->project_name)->toBe('Project X');
});

it('can have users attached with a role', function () {
    $team = Team::factory()->create();
    $user = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'admin']);

    expect($team->users)->toHaveCount(1)
        ->and($team->users->first()->pivot->role)->toBe('admin');
});

it('can have multiple users with different roles', function () {
    $team  = Team::factory()->create();
    $users = User::factory(3)->create();

    $team->users()->attach($users[0]->id, ['role' => 'admin']);
    $team->users()->attach($users[1]->id, ['role' => 'member']);
    $team->users()->attach($users[2]->id, ['role' => 'viewer']);

    $team->load('users');

    expect($team->users)->toHaveCount(3);

    $roles = $team->users->pluck('pivot.role')->sort()->values()->all();
    expect($roles)->toBe(['admin', 'member', 'viewer']);
});

it('can belong to many users', function () {
    $team = Team::factory()->create();

    expect($team->users())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsToMany::class);
});
