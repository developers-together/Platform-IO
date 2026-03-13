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
            $table->string('title', 150);
            $table->boolean('starred')->default(false);
            $table->text('description')->nullable();
            $table->dateTime('deadline')->nullable();
            // $table->dateTime('start')->nullable();
            $table->boolean('completed')->default(false);
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            // $table->string("categroy")->nullable();
            $table->enum('priority', ['must','should','could','willnot']);
            $table->foreignId('parent_task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('task_user', function (Blueprint $table) {
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['task_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_user');
        Schema::dropIfExists('tasks');
    }
};
