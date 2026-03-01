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
            // $table->boolean('stared')->default(false);
            $table->text('description')->nullable();
            $table->dateTime('deadline')->nullable();
            // $table->dateTime('start')->nullable();
            $table->boolean('completed')->default(false);
            $table->string('team_id');
            // $table->string("categroy")->nullable();
            $table->enum('priority', ['must','should','could','willnot']);
            $table->foreignId('task_id')->onDelete('cascade')->nullable();
            $table->timestamps();
        });

        Schema::create('task_user', function (Blueprint $table) {

            $table->foreignId('task_id')->onDelete('cascade');
            $table->foreginId('user_id')->onDelete('cascade');
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
