<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCommentVotesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create(
            'comment_votes',
            static function (Blueprint $table) {
                $table->id();
                $table->foreignId('comment_id')->nullable()->constrained();
                $table->foreignId('user_id')->nullable()->constrained();
                $table->tinyInteger('vote');
                $table->unique(['comment_id', 'user_id']);
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
        Schema::dropIfExists('comment_votes');
    }
}
