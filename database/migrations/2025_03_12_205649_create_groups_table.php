<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('team_id');
            $table->enum('type',['text','voice']);
            $table->timestamps();
        });

        Schema::create('chat_perms',function (Blueprint $table){
            $table->foreignId('chat_id');
            $table->boolean('write');
            $table->boolean('read');
            $table->boolean('delete');
            $table->boolean('modify');
            $table->boolean('notify');
            $table->boolean('allow_ai');

        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chats');
    }
};
