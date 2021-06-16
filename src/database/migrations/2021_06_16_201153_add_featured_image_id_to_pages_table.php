<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFeaturedImageIdToPagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table(
            'pages',
            static function (Blueprint $table) {
                $table->foreignId('featured_image_id')->nullable()->constrained('media');
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
        Schema::table(
            'pages',
            static function (Blueprint $table) {
                $table->dropColumn('featured_image_id');
            }
        );
    }
}
