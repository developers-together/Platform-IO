<?php
namespace App\Policies;

use App\Models\Message;
use App\Models\ChatPerm;
use App\Models\Chat;
use App\Models\User;

class MessagePolicy
{
    public function delete(User $user, Chat $chat): bool
    {
        $pivot = $chat->team->users()->wherePivot('user_id',$user->id)->first()?->pivot;

        if($pivot && in_array($pivot->role,['admin','owner'])){
            return true;
        }

        $perm = $chat->ChatPerm->first();

        return $pivot && $perm && $perm->delete == true;
    }

    public function sendMessage(User $user, Chat $chat){

        $pivot = $chat->team->users()->wherePivot('user_id',$user->id)->first()?->pivot;

        if($pivot && in_array($pivot->role,['admin','owner'])){
            return true;
        }

        $perm = $chat->ChatPerm->first();

        return $pivot && $perm && $perm->write == true;

    }

    public function update(User $user, Chat $chat){

        $pivot = $chat->team->users()->wherePivot('user_id',$user->id)->first()?->pivot;

        if($pivot && in_array($pivot->role,['admin','owner'])){
            return true;
        }

        $perm = $chat->ChatPerm->first();

        return $pivot && $perm && $perm->modify == true;

    }

    public function notify(User $user, Chat $chat){



        $perm = $chat->ChatPerm->first();

        return $perm && $perm->notify == true;
    }


    public function getMessages(User $user, Chat $chat){

        $pivot = $chat->team->users()->wherePivot('user_id',$user->id)->first()?->pivot;

        if($pivot && in_array($pivot->role,['admin','owner'])){
            return true;
        }

        $perm = $chat->ChatPerm->first();

        return $pivot && $perm && $perm->read == true;
    }
}
