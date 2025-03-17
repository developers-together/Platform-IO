<?php

namespace App\Policies;

use App\Models\Ai_chat;
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Gemini\Laravel\Facades\Gemini;

class Ai_chatPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->teams()->exists();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Ai_chat $ai_chat)
    {
        // Adjust logic as needed — here, user must be in ai_chat's team
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->teams()->exists();
    }

    /**
     * Determine whether the user can update the model.
     */

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Chat $chat)
    {
        return true; // ← For testing only
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Ai_chat $ai_chat): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Ai_chat $ai_chat): bool
    {
        return false;
    }
}
