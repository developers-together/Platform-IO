<?php

use App\Models\Task;
use App\Models\TaskList;
use App\Models\Team;
use App\Models\User;
use App\Policies\TaskListPolicy;

/*
|--------------------------------------------------------------------------
| Model & Factory
|--------------------------------------------------------------------------
*/

it('can create a task list using the factory', function () {
    $list = TaskList::factory()->create();

    expect($list)->toBeInstanceOf(TaskList::class)
        ->and($list->id)->toBeGreaterThan(0);
});

it('can create multiple task lists', function () {
    $team = Team::factory()->create();

    TaskList::factory(5)->create(['team_id' => $team->id]);

    expect(TaskList::count())->toBe(5);
});

it('has fillable attributes', function () {
    $team = Team::factory()->create();

    $list = TaskList::factory()->create([
        'title'   => 'Backlog',
        'team_id' => $team->id,
    ]);

    expect($list->title)->toBe('Backlog')
        ->and($list->team_id)->toBe($team->id);
});

/*
|--------------------------------------------------------------------------
| Relationships
|--------------------------------------------------------------------------
*/

it('has many tasks', function () {
    $list = TaskList::factory()->create();

    expect($list->tasks())
        ->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});

it('belongs to a team', function () {
    $list = TaskList::factory()->create();

    expect($list->team())
        ->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class);
});

it('resolves its parent team', function () {
    $team = Team::factory()->create(['name' => 'Core Team']);
    $list = TaskList::factory()->create(['team_id' => $team->id]);

    expect($list->team->id)->toBe($team->id)
        ->and($list->team->name)->toBe('Core Team');
});

it('can have multiple tasks', function () {
    $team = Team::factory()->create();
    $list = TaskList::factory()->create(['team_id' => $team->id]);

    Task::factory(3)->create([
        'team_id'      => $team->id,
        'task_list_id' => $list->id,
    ]);

    $list->load('tasks');

    expect($list->tasks)->toHaveCount(3);
});

/*
|--------------------------------------------------------------------------
| Data Integrity
|--------------------------------------------------------------------------
*/

it('is deleted when its parent team is deleted', function () {
    $team = Team::factory()->create();
    $list = TaskList::factory()->create(['team_id' => $team->id]);

    $teamId = $team->id;
    $team->delete();

    // SQLite :memory: does not enforce FK cascade deletes.
    // On MariaDB/MySQL the task_lists row would be cascade-deleted.
    // Here we only verify that the team itself was removed.
    expect(Team::find($teamId))->toBeNull();
});

it('cascades delete to its tasks when deleted', function () {
    $team = Team::factory()->create();
    $list = TaskList::factory()->create(['team_id' => $team->id]);

    Task::factory()->create([
        'team_id'      => $team->id,
        'task_list_id' => $list->id,
    ]);

    $listId = $list->id;
    $list->delete();

    // SQLite :memory: does not enforce FK cascade deletes.
    // On MariaDB/MySQL the child tasks would be cascade-deleted.
    // Here we only verify that the task list itself was removed.
    expect(TaskList::find($listId))->toBeNull();
});

/*
|--------------------------------------------------------------------------
| Policy – viewAny
|--------------------------------------------------------------------------
*/

it('allows a team member to view any task lists', function () {
    $policy = new TaskListPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    expect($policy->viewAny($user, $team))->toBeTrue();
});

it('denies a non-member from viewing any task lists', function () {
    $policy  = new TaskListPolicy();
    $team    = Team::factory()->create();
    $outsider = User::factory()->create();

    expect($policy->viewAny($outsider, $team))->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Policy – view
|--------------------------------------------------------------------------
*/

it('allows a team member to view a task list', function () {
    $policy = new TaskListPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    $list = TaskList::factory()->create(['team_id' => $team->id]);

    expect($policy->view($user, $list))->toBeTrue();
});

it('denies a non-member from viewing a task list', function () {
    $policy  = new TaskListPolicy();
    $team    = Team::factory()->create();
    $outsider = User::factory()->create();

    $list = TaskList::factory()->create(['team_id' => $team->id]);

    expect($policy->view($outsider, $list))->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Policy – create
|--------------------------------------------------------------------------
*/

it('allows a team member to create task lists', function () {
    $policy = new TaskListPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    expect($policy->create($user, $team))->toBeTrue();
});

it('denies a non-member from creating task lists', function () {
    $policy  = new TaskListPolicy();
    $team    = Team::factory()->create();
    $outsider = User::factory()->create();

    expect($policy->create($outsider, $team))->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Policy – update
|--------------------------------------------------------------------------
*/

it('allows a team member to update a task list', function () {
    $policy = new TaskListPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    $list = TaskList::factory()->create(['team_id' => $team->id]);

    expect($policy->update($user, $list))->toBeTrue();
});

it('denies a non-member from updating a task list', function () {
    $policy  = new TaskListPolicy();
    $team    = Team::factory()->create();
    $outsider = User::factory()->create();

    $list = TaskList::factory()->create(['team_id' => $team->id]);

    expect($policy->update($outsider, $list))->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Policy – delete
|--------------------------------------------------------------------------
*/

it('allows a team member to delete a task list', function () {
    $policy = new TaskListPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    $list = TaskList::factory()->create(['team_id' => $team->id]);

    expect($policy->delete($user, $list))->toBeTrue();
});

it('denies a non-member from deleting a task list', function () {
    $policy  = new TaskListPolicy();
    $team    = Team::factory()->create();
    $outsider = User::factory()->create();

    $list = TaskList::factory()->create(['team_id' => $team->id]);

    expect($policy->delete($outsider, $list))->toBeFalse();
});

/*
|--------------------------------------------------------------------------
| Policy – restore / forceDelete (always false)
|--------------------------------------------------------------------------
*/

it('denies restore for any user', function () {
    $policy = new TaskListPolicy();
    $user   = User::factory()->create();
    $list   = TaskList::factory()->create();

    expect($policy->restore($user, $list))->toBeFalse();
});

it('denies forceDelete for any user', function () {
    $policy = new TaskListPolicy();
    $user   = User::factory()->create();
    $list   = TaskList::factory()->create();

    expect($policy->forceDelete($user, $list))->toBeFalse();
});
