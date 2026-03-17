<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Inertia\Inertia;

class Calendar extends Model
{
    use HasFactory;

    protected $fillable = ['team_id', 'name', 'color', 'uri'];

    public function event(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    protected static function booted(): void
    {
        static::creating(function (Calendar $calendar) {
            if (empty($calendar->uri)) {
                $calendar->uri = (string) Str::uuid();
            }
        });
    }

    public function shares()
    {
        // return Inertia::render
        return $this->hasMany(CalendarShare::class);
    }

    public function sharedWith()
    {
        return $this->belongsToMany(User::class, 'calendar_shares', 'calendar_id', 'shared_with_user_id')
            ->withPivot('permission')
            ->withTimestamps();
    }
}
