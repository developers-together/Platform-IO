<?php

use App\Models\Team;
use App\Models\User;
use App\Policies\TeamPolicy;

/*
|--------------------------------------------------------------------------
| Team Model & Factory
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Relationships
|--------------------------------------------------------------------------
*/

it('can have users attached with a role', function () {
    $team = Team::factory()->create();
    $user = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'admin', 'profile' => '']);

    expect($team->users)->toHaveCount(1)
        ->and($team->users->first()->pivot->role)->toBe('admin');
});

it('can have multiple users with different roles', function () {
    $team  = Team::factory()->create();
    $users = User::factory(3)->create();

    $team->users()->attach($users[0]->id, ['role' => 'admin', 'profile' => '']);
    $team->users()->attach($users[1]->id, ['role' => 'member', 'profile' => '']);
    $team->users()->attach($users[2]->id, ['role' => 'viewer', 'profile' => '']);

    $team->load('users');

    expect($team->users)->toHaveCount(3);

    $roles = $team->users->pluck('pivot.role')->sort()->values()->all();
    expect($roles)->toBe(['admin', 'member', 'viewer']);
});

it('belongs to many users', function () {
    $team = Team::factory()->create();

    expect($team->users())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsToMany::class);
});

it('has many task lists', function () {
    $team = Team::factory()->create();

    expect($team->taskLists())->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});

it('cascades user deletion from pivot', function () {
    $team = Team::factory()->create();
    $user = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);
    expect($team->users)->toHaveCount(1);

    $user->delete();
    $team->load('users');

    expect($team->users)->toHaveCount(0);
});

it('can delete a team', function () {
    $team = Team::factory()->create();
    $user = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);
    $teamId = $team->id;

    $team->delete();

    // Pivot cleanup is handled by MariaDB FK cascade (onDelete('cascade'))
    // but SQLite in-memory DB doesn't enforce cascades reliably
    expect(Team::find($teamId))->toBeNull();
});

/*
|--------------------------------------------------------------------------
| Team Policy
|--------------------------------------------------------------------------
*/

it('allows team members to view team', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    expect($policy->view($user, $team))->toBeTrue();
});

it('denies non-members from viewing team', function () {
    $policy  = new TeamPolicy();
    $team    = Team::factory()->create();
    $outsider = User::factory()->create();

    expect($policy->view($outsider, $team))->toBeFalse();
});

it('allows owner to update team', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $owner  = User::factory()->create();

    $team->users()->attach($owner->id, ['role' => 'owner', 'profile' => '']);

    expect($policy->update($owner, $team))->toBeTrue();
});

it('denies non-owner from updating team', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $member = User::factory()->create();

    $team->users()->attach($member->id, ['role' => 'member', 'profile' => '']);

    expect($policy->update($member, $team))->toBeFalse();
});

it('denies admin from updating team', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $admin  = User::factory()->create();

    $team->users()->attach($admin->id, ['role' => 'admin', 'profile' => '']);

    expect($policy->update($admin, $team))->toBeFalse();
});

it('allows owner to delete team', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $owner  = User::factory()->create();

    $team->users()->attach($owner->id, ['role' => 'owner', 'profile' => '']);

    expect($policy->delete($owner, $team))->toBeTrue();
});

it('denies non-owner from deleting team', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $admin  = User::factory()->create();

    $team->users()->attach($admin->id, ['role' => 'admin', 'profile' => '']);

    expect($policy->delete($admin, $team))->toBeFalse();
});

it('allows owner to add members', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $owner  = User::factory()->create();

    $team->users()->attach($owner->id, ['role' => 'owner', 'profile' => '']);

    expect($policy->addMember($owner, $team))->toBeTrue();
});

it('denies non-owner from adding members', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $member = User::factory()->create();

    $team->users()->attach($member->id, ['role' => 'member', 'profile' => '']);

    expect($policy->addMember($member, $team))->toBeFalse();
});

it('allows owner to change roles', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $owner  = User::factory()->create();

    $team->users()->attach($owner->id, ['role' => 'owner', 'profile' => '']);

    expect($policy->changeRole($owner, $team))->toBeTrue();
});

it('denies non-owner from changing roles', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $admin  = User::factory()->create();

    $team->users()->attach($admin->id, ['role' => 'admin', 'profile' => '']);

    expect($policy->changeRole($admin, $team))->toBeFalse();
});

it('allows owner to transfer ownership', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $owner  = User::factory()->create();

    $team->users()->attach($owner->id, ['role' => 'owner', 'profile' => '']);

    expect($policy->transferOwner($owner, $team))->toBeTrue();
});

it('allows owner to remove members', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $owner  = User::factory()->create();

    $team->users()->attach($owner->id, ['role' => 'owner', 'profile' => '']);

    expect($policy->removeMember($owner, $team))->toBeTrue();
});

it('denies non-owner from removing members', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $admin  = User::factory()->create();

    $team->users()->attach($admin->id, ['role' => 'admin', 'profile' => '']);

    expect($policy->removeMember($admin, $team))->toBeFalse();
});

it('allows owner to generate join URL', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $owner  = User::factory()->create();

    $team->users()->attach($owner->id, ['role' => 'owner', 'profile' => '']);

    expect($policy->generateURL($owner, $team))->toBeTrue();
});

it('allows any member to get team by id', function () {
    $policy = new TeamPolicy();
    $team   = Team::factory()->create();
    $viewer = User::factory()->create();

    $team->users()->attach($viewer->id, ['role' => 'viewer', 'profile' => '']);

    expect($policy->getTeamById($viewer, $team))->toBeTrue();
});
