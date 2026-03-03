<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{

    protected $fillable = ['calender_id','title','desc','start_at','end_at',
        'is_all_day','timezone','rrule'];

    public function task(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}
