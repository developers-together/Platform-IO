<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Team $team): bool
    {
        return $team->users()
            ->where('user_id', $user->id)
            ->where(function ($query) {
                $query->wherePivot('role', 'leader')
                      ->orWherePivot('role', 'member');
            })
            ->exists(); 
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Team $team): bool
    {
        return $team->users()
        ->where('user_id', $user->id)
        ->where(function ($query) {
            $query->wherePivot('role', 'leader')
                  ->orWherePivot('role', 'member');
        })
        ->exists(); 
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Team $team): bool
    {
        return $team->users()
        ->where('user_id', $user->id)
        ->where(function ($query) {
            $query->wherePivot('role', 'leader')
                  ->orWherePivot('role', 'member');
        })
        ->exists(); 
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Task $task): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Task $task): bool
    {
        return false;
    }
}
