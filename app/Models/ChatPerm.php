<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatPerm extends Model
{
    use HasFactory;

    protected $fillable = ['chat_id', 'write', 'read', 'delete', 'modify', 'notify', 'allow_ai'];

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }
}
