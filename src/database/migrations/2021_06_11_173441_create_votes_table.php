<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVotesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create(
            'votes',
            static function (Blueprint $table) {
                $table->id();
                $table->morphs('voteable');
                $table->foreignId('user_id')->nullable()->constrained();
                $table->tinyInteger('vote');
                $table->unique(['voteable_id', 'voteable_type', 'user_id']);
                $table->timestamps();
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
        Schema::dropIfExists('votes');
    }
}
