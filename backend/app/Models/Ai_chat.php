<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\hasMany;
use App\Models\Ai_Messages;

class Ai_chat extends Model
{
    protected $fillable = ['name','team_id'];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function ai_messages(): HasMany
    {
        return $this->hasMany(Ai_Messages::class, 'ai_chats_id');
    }


    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($ai_chat) {
            $ai_chat->ai_messages()->delete();
        });
    }
}
