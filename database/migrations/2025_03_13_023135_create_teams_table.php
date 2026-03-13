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
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('project_name', 100);
            $table->text('description')->nullable();
            // $table->string('code', 6)->unique();
            $table->timestamps();
        });

        Schema::create('team_communications', function (Blueprint $table) {

            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->string('contact');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_communications');
        Schema::dropIfExists('teams');
    }
};
