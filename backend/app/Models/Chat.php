<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Chat extends Model
{
    // use HasFactory;

    protected $fillable = ['name','team_id'];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

}
