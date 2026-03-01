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
        Schema::create('AI-perms', function (Blueprint $table) {

            $table->foreignId('team_id');
            $table->boolean('chat')->default(false);
            $table->boolean('tasks')->default(false);
            $table->boolean('calender')->default(false);
            $table->boolean('dread')->default(true);
            $table->boolean('dwrite')->default(true);
            $table->boolean('ddelete')->default(false);
            $table->boolean('dmodify')->default(true);
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
