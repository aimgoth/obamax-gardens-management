<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // bar_stock_taking_items: wastage + wastage_value already added by 2026_03_02_120000
        // bar_stock_takings: total_wastage_value already added by 2026_03_02_120000
        // Only add the missing total_wastage_bottles column
        Schema::table('bar_stock_takings', function (Blueprint $table) {
            $table->integer('total_wastage_bottles')->default(0)->after('total_expected_revenue');
        });
    }

    public function down(): void
    {
        Schema::table('bar_stock_takings', function (Blueprint $table) {
            $table->dropColumn('total_wastage_bottles');
        });
    }
};
