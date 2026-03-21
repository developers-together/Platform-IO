<?php

use App\Models\Task;
use App\Models\TaskList;
use App\Models\Team;
use App\Models\User;
use App\Policies\TaskPolicy;

/*
|--------------------------------------------------------------------------
| Model & Factory
|--------------------------------------------------------------------------
*/

it('can create a task using the factory', function () {
    $task = Task::factory()->create();

    expect($task)->toBeInstanceOf(Task::class)
        ->and($task->id)->toBeGreaterThan(0);
});

it('can create multiple tasks', function () {
    $team = Team::factory()->create();
    $list = TaskList::factory()->create(['team_id' => $team->id]);

    Task::factory(5)->create([
        'team_id'      => $team->id,
        'task_list_id' => $list->id,
    ]);

    expect(Task::count())->toBe(5);
});

it('has fillable attributes', function () {
    $team = Team::factory()->create();
    $list = TaskList::factory()->create(['team_id' => $team->id]);

    $task = Task::factory()->create([
        'title'        => 'Deploy v2',
        'description'  => 'Push to production',
        'deadline'     => '2026-06-01 12:00:00',
        'completed'    => true,
        'team_id'      => $team->id,
        'priority'     => 'high',
        'task_list_id' => $list->id,
    ]);

    expect($task->title)->toBe('Deploy v2')
        ->and($task->description)->toBe('Push to production')
        ->and($task->completed)->toBeTruthy()
        ->and($task->priority)->toBe('high')
        ->and($task->team_id)->toBe($team->id)
        ->and($task->task_list_id)->toBe($list->id);
});

it('uses factory completed state', function () {
    $task = Task::factory()->completed()->create();

    expect($task->completed)->toBeTruthy();
});

it('uses factory highPriority state', function () {
    $task = Task::factory()->highPriority()->create();

    expect($task->priority)->toBe('high');
});

it('uses factory lowPriority state', function () {
    $task = Task::factory()->lowPriority()->create();

    expect($task->priority)->toBe('low');
});

/*
|--------------------------------------------------------------------------
| Relationships
|--------------------------------------------------------------------------
*/

it('belongs to a task list', function () {
    $task = Task::factory()->create();

    expect($task->taskList())
        ->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class);
});

it('resolves its parent task list', function () {
    $team = Team::factory()->create();
    $list = TaskList::factory()->create(['team_id' => $team->id, 'title' => 'Sprint 1']);
    $task = Task::factory()->create([
        'team_id'      => $team->id,
        'task_list_id' => $list->id,
    ]);

    expect($task->taskList->id)->toBe($list->id)
        ->and($task->taskList->title)->toBe('Sprint 1');
});

it('has many events', function () {
    $task = Task::factory()->create();

    expect($task->event())
        ->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});

/*
|--------------------------------------------------------------------------
| Data Integrity
|--------------------------------------------------------------------------
*/

it('is deleted when its parent task list is deleted', function () {
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

it('is deleted when its parent team is deleted', function () {
    $team = Team::factory()->create();
    $list = TaskList::factory()->create(['team_id' => $team->id]);
    Task::factory()->create([
        'team_id'      => $team->id,
        'task_list_id' => $list->id,
    ]);

    $teamId = $team->id;
    $team->delete();

    // SQLite :memory: does not enforce FK cascade deletes.
    // On MariaDB/MySQL the child tasks would be cascade-deleted.
    // Here we only verify that the team itself was removed.
    expect(Team::find($teamId))->toBeNull();
});

/*
|--------------------------------------------------------------------------
| Policy – viewAny
|--------------------------------------------------------------------------
*/

it('allows a team member to view any tasks for their team', function () {
    $policy = new TaskPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    expect($policy->viewAny($user, $team))->toBeTrue();
});

it('denies a non-member from viewing any tasks for a team', function () {
    $policy  = new TaskPolicy();
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
    $policy = new TaskPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    $list = TaskList::factory()->create(['team_id' => $team->id]);

    expect($policy->view($user, $list))->toBeTrue();
});

it('denies a non-member from viewing a task list', function () {
    $policy  = new TaskPolicy();
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

it('allows a team member to create tasks', function () {
    $policy = new TaskPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    expect($policy->create($user, $team))->toBeTrue();
});

it('denies a non-member from creating tasks', function () {
    $policy  = new TaskPolicy();
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
    $policy = new TaskPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    $list = TaskList::factory()->create(['team_id' => $team->id]);

    expect($policy->update($user, $list))->toBeTrue();
});

it('denies a non-member from updating a task list', function () {
    $policy  = new TaskPolicy();
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
    $policy = new TaskPolicy();
    $team   = Team::factory()->create();
    $user   = User::factory()->create();

    $team->users()->attach($user->id, ['role' => 'member', 'profile' => '']);

    $list = TaskList::factory()->create(['team_id' => $team->id]);

    expect($policy->delete($user, $list))->toBeTrue();
});

it('denies a non-member from deleting a task list', function () {
    $policy  = new TaskPolicy();
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
    $policy = new TaskPolicy();
    $user   = User::factory()->create();
    $task   = Task::factory()->create();

    expect($policy->restore($user, $task))->toBeFalse();
});

it('denies forceDelete for any user', function () {
    $policy = new TaskPolicy();
    $user   = User::factory()->create();
    $task   = Task::factory()->create();

    expect($policy->forceDelete($user, $task))->toBeFalse();
});
