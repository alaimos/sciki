<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSimulationsTable extends Migration
{

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create(
            'simulations',
            function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('remote_id')->nullable();
                $table->tinyInteger('status');
                $table->string('name');
                $table->foreignId('organism_id')->constrained()->restrictOnDelete();
                $table->string('output_file')->nullable();
                $table->string('pathway_output_file')->nullable();
                $table->string('nodes_output_file')->nullable();
                $table->foreignId('user_id')->constrained();
                $table->timestamps();
                $table->softDeletes();
            }
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('simulations');
    }
}