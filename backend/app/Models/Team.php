<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    public function users()
    {
        return $this->belongsToMany(User::class)
                    ->withPivot('role')
                    ->withTimestamps();
    }



    protected $fillable = ['name','description','projectname','code'];

    public function tasks(): HasMany
    {
        return $this->hasMany(Tasks::class);
    }

}
