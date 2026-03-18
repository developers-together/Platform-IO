<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
        use HasApiTokens;
        use HasFactory;
        use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        // 'age',
        'job',
        // 'location',
        'phone',
        'gender',
        'profile',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function contacts(): HasMany
    {
        return $this->HasMany(Contact::class);
    }

    public function messages(): HasMany
    {
        return $this->HasMany(Message::class);
    }
    public function chats(): HasMany
    {
        return $this->hasMany(chat::class);
    }
    // public function ai_chats(): HasMany
    // {
        // return $this->hasMany(Ai_chats::class);
    // }

    // public function messages()
    // {
    //     return $this->hasMany(Message::class);
    // }

    public function teams(): belongsToMany
    {
        return $this->belongsToMany(Team::class)
                    ->withPivot('role')
                    ->withTimestamps();
    }

    // public function getSftpUsernameAttribute()
    // {
    //     return 'user_' . $this->id . '_' . md5($this->created_at);
    // }
}
