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
        Schema::create('event_task', function (Blueprint $table) {
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->primary(['event_id', 'task_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_task');
    }
};
