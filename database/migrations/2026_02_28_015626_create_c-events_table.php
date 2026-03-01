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
        Schema::create('c-events', function (Blueprint $table) {

            $table->id();
            $table->foreignId('calender_id')->onDelete('cascade');
            $table->string('title');
            $table->string('desc');
            $table->time('start');
            $table->time('end');
            $table->boolean('is_all_day');
            // $table->string('timezone');
            $table->string('rrule');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
