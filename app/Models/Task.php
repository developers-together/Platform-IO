<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'deadline',
    'completed', 'team_id', 'priority', 'task_list_id'];



    // protected $casts = [
    //     'completed' => 'boolean',
    // ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function taskList(): BelongsTo
    {
        return $this->belongsTo(TaskList::class);
    }

    public function event(): HasMany
    {
        return $this->HasMany(Event::class);
    }

}
