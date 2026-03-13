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
        Schema::create('ai_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->boolean('chat')->default(false);
            $table->boolean('tasks')->default(false);
            $table->boolean('calendar')->default(false);
            $table->boolean('directory_read')->default(true);
            $table->boolean('directory_write')->default(true);
            $table->boolean('directory_delete')->default(false);
            $table->boolean('directory_modify')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_permissions');
    }
};
