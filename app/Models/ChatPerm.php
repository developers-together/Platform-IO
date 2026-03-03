<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatPerm extends Model
{
    protected $fillable = ['chat_id','write','read','delete',
        'modify','allow_ai'];

//     public function Chat():BelongsTo
//     {
//         return BelongsTo(Chat::class);
//
// }
}
