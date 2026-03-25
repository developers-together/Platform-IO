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
        Schema::create('turn_sessions', function (Blueprint $table) {
            $table->id();

            // Which user owns this session
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();

            // The TURN username (format: timestamp:userId)
            // Coturn uses this to validate credentials
            $table->string('username');

            // Optional: which room/channel this session belongs to
            $table->string('room_id')->nullable();

            // When the credentials expire (set by TTL)
            $table->timestamp('expires_at');

            // Set when we explicitly terminate the session
            $table->timestamp('terminated_at')->nullable();

            $table->timestamps();

            $table->index('user_id');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('turn_sessions');
    }
};
