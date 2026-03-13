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
            $table->string('name', 100);
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->enum('type',['text','voice']);
            $table->timestamps();
        });

        Schema::create('chat_permissions',function (Blueprint $table){
            $table->foreignId('chat_id')->constrained()->cascadeOnDelete();
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
        Schema::dropIfExists('chat_permissions');
        Schema::dropIfExists('chats');
    }
};
