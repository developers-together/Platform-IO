<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TurnSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'username',
        'room_id',
        'expires_at',
        'terminated_at',
    ];

    protected $casts = [
        'expires_at'     => 'datetime',
        'terminated_at'  => 'datetime',
    ];

    // Check if this session is still usable
    public function isActive(): bool
    {
        return $this->terminated_at === null
            && $this->expires_at->isFuture();
    }

    // Relationship back to the user
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scope: only active sessions
    public function scopeActive($query)
    {
        return $query
            ->whereNull('terminated_at')
            ->where('expires_at', '>', now());
    }

    // Scope: only expired or terminated sessions
    public function scopeInactive($query)
    {
        return $query
            ->where(function ($q) {
                $q->whereNotNull('terminated_at')
                  ->orWhere('expires_at', '<=', now());
            });
    }
}
