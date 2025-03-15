<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Model;

class Message extends Model
{
    // use HasFactory;

    protected $fillable = ['user_id', 'chat_id', 'message'];
    

    public function users(): BelongsTo
    {
        return $this->BelongsTo(User::class);
    }


    public function chats(): BelongsTo
    {
        return $this->BelongsTo(Chat::class);
    }

}

