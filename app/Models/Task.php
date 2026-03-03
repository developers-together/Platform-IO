<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description',
        'end','start', 'completed','stared','team_id','task_id',
   'priority'];

    // protected $casts = [
    //     'completed' => 'boolean',
    // ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function event(): HasMany
    {
        return $this->HasMany(Event::class);
    }

}
