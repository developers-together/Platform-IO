<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ai_Messages extends Model
{
    protected $table = 'ai_messages';

    protected $fillable = ['user_id', 'ai_chats_id', 'prompt', 'response', 'ai'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ai_chat(): BelongsTo
    {
        return $this->belongsTo(Ai_Chat::class, 'ai_chats_id');
    }
}

