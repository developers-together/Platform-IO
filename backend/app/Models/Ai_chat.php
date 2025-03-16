<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ai_chat extends Model
{
    protected $fillable = ['name','team_id','user_id','prompt','response', 'ai'];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
