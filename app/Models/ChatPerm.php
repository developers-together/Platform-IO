<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatPerm extends Model
{
    use HasFactory;

    protected $table = 'chat_permissions';

    protected $casts = [
    'write'    => 'boolean',
    'read'     => 'boolean',
    'delete'   => 'boolean',
    'modify'   => 'boolean',
    'notify'   => 'boolean',
    'allow_ai' => 'boolean',
    ];

    protected $fillable = ['chat_id', 'write', 'read', 'delete', 'modify', 'notify', 'allow_ai'];

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }
}

