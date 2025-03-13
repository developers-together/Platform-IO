<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class Message extends Pivot
{
    // use HasFactory;

    protected $fillable = ['user_id', 'chat_id', 'message'];

    // public function user()
    // {
    //     return $this->belongsTo(User::class);
    // }

    // public function chat()
    // {
    //     return $this->belongsTo(Chat::class);
    // }
}

