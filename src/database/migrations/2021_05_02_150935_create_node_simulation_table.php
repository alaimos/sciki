<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateNodeSimulationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create(
            'node_simulation',
            function (Blueprint $table) {
                $table->foreignId('node_id');
                $table->foreignId('simulation_id');
                $table->tinyInteger('type');
                $table->primary(['node_id', 'simulation_id']);
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
        Schema::dropIfExists('node_simulation');
    }
}
