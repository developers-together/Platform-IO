<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CalendarShare extends Model
{
    protected $fillable = ['calendar_id','user_id','permission'];
}
