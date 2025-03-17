<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ai_chat extends Model
{
    protected $fillable = ['name','team_id'];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function Ai_Messages(): HasMany
    {
        return $this->HasMany(Ai_Message::class);

    }
}
