<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Team extends Model
{
    use HasFactory;

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
                    ->withPivot('role')
                    ->withTimestamps();
    }



    protected $fillable = ['name','description','project_name'];

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function comms(): HasMany
    {
        return $this->hasMany(Comm::class);
    }
    // public function ai_chats(): HasMany
    // {
    //     return $this->hasMany(ai_chats::class);
    // }

}
