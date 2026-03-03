<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Calender extends Model
{
    protected $fillable = ['team_id','name','color','uri'];

    public function event(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
