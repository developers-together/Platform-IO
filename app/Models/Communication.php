<?php

namespace App\Models;

use Database\Factories\CommunicationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Communication extends Model
{
    /** @use HasFactory<CommunicationFactory> */
    use HasFactory;

    protected $table = 'team_communications';

    protected $fillable = ['team_id', 'contact'];

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): CommunicationFactory
    {
        return CommunicationFactory::new();
    }
}
