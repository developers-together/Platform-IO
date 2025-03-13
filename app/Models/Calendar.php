<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Calendar extends Model
{
    use HasFactory;
    protected $fillable = ['title', 'date', 'completed'];

    protected $casts = [
        'completed' => 'boolean',
    ];
}
