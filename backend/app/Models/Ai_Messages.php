<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ai_Messages extends Model
{
    protected $fillable = ['user_id', 'chat_id', 'message','prompt','response', 'ai'];
    public function users(): BelongsTo
    {
        return $this->BelongsTo(User::class);
    }


    public function chats(): BelongsTo
    {
        return $this->BelongsTo(Chat::class);
    }
}
