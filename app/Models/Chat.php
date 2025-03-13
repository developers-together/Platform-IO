<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    // use HasFactory;

    protected $fillable = ['name'];

    public function users()
    {
        return $this->belongsToMany(User::class,'messages')
                    ->withPivot('message')
                    ->withTimestamps();
    }

    // public function messages()
    // {
    //     return $this->hasMany(Message::class);
    // }
}
