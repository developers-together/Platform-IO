<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('team.{team_id}.chat.{chat_id}.get', function ($user, $team_id, $chat_id) {
    $chat = Chat::find($chat_id);

    if (!$chat) {
        return false;
    }

    $pivot = $chat->team->users()->wherePivot('user_id',$user->id)->first()?->pivot;

        if($pivot && in_array($pivot->role,['admin','owner'])){
            return true;
        }

        $perm = $chat->ChatPerm->first();

        return $pivot && $perm && $perm->read == true;
});

Broadcast::channel('team.{team_id}.chat.{chat_id}.edit', function ($user, $team_id, $chat_id) {
    $chat = Chat::find($chat_id);

    if (!$chat) {
        return false;
    }

    $pivot = $chat->team->users()->wherePivot('user_id',$user->id)->first()?->pivot;

        if($pivot && in_array($pivot->role,['admin','owner'])){
            return true;
        }

        $perm = $chat->ChatPerm->first();

        return $pivot && $perm && $perm->modify == true;
});

