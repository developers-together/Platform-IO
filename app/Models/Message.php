<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'chat_id', 'message', 'path', 'reply_to'];


    public function user(): BelongsTo
    {
        return $this->BelongsTo(User::class);
    }


    public function chat(): BelongsTo
    {
        return $this->BelongsTo(Chat::class);
    }

}

