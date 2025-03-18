<?php

namespace App\Policies;

use App\Models\File;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class FilePolicy
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
    public function view(User $user, File $file): bool
    {
        return $file->team->users()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->teams()->whereIn('role', ['leader', 'member'])->exists();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, File $file): bool
    {
        return $file->team->users()
            ->where('user_id', $user->id)
            ->whereIn('role', ['leader', 'member'])
            ->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, File $file): bool
    {
        return $file->team->users()->where('user_id', $user->id)->whereIn('role', ['leader', 'member'])->exists();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, File $file): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, File $file): bool
    {
        return false;
    }
}
