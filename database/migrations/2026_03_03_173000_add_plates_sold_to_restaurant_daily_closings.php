<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurant_daily_closings', function (Blueprint $table) {
            $table->integer('plates_sold')->nullable()->after('cash_collected');
        });
    }

    public function down(): void
    {
        Schema::table('restaurant_daily_closings', function (Blueprint $table) {
            $table->dropColumn('plates_sold');
        });
    }
};
