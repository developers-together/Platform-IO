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
        Schema::create('events', function (Blueprint $table) {

            $table->id();
            $table->foreignId('calendar_id')->constrained()->cascadeOnDelete();
            $table->string('title', 150);
            $table->text('description')->nullable();
            $table->dateTime('start');
            $table->dateTime('end');
            $table->boolean('is_all_day')->default(false);
            $table->string('timezone', 50)->default('UTC');
            $table->text('rrule')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
