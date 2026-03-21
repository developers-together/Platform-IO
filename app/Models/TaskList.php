<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class TaskList extends Model
{
    use HasFactory;


    protected $fillable = ['title','team_id'];

    public function tasks(): HasMany
    {

        return $this->hasMany(Task::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

}
