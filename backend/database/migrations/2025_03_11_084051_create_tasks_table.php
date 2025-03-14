<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->bool('stared')->default(false);
            $table->text('description')->nullable();
            $table->dateTime('end')->nullable();
            $table->dateTime('start')->nullable();
            $table->boolean('completed')->default(false);
            $table->string('team_id');
            $table->string("categroy")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
