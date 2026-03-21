<?php

namespace App\Policies;

use App\Models\TaskList;
use App\Models\User;
use App\Models\Team;
use Illuminate\Auth\Access\Response;

class TaskListPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, Team $team): bool
    {
        return $user->teams()->wherePivot('Team_id',$team->id)->exists();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TaskList $taskList): bool
    {
        return $user->teams()->wherePivot('team_id',$taskList->team()->first()->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Team $team): bool
    {
        return $user->teams()->wherePivot('team_id',$team->id)->exists();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TaskList $taskList): bool
    {
        return $user->teams()->wherePivot('team_id',$taskList->team()->first()->id)->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TaskList $taskList): bool
    {
        return $user->teams()->wherePivot('team_id',$taskList->team()->first()->id)->exists();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, TaskList $taskList): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, TaskList $taskList): bool
    {
        return false;
    }
}
