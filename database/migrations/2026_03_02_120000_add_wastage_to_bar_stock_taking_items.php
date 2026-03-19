<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bar_stock_taking_items', function (Blueprint $table) {
            $table->integer('wastage')->default(0)->after('closing_stock');
            $table->decimal('wastage_value', 12, 2)->default(0)->after('wastage');
        });

        Schema::table('bar_stock_takings', function (Blueprint $table) {
            $table->decimal('total_wastage_value', 12, 2)->default(0)->after('total_expected_revenue');
        });
    }

    public function down(): void
    {
        Schema::table('bar_stock_taking_items', function (Blueprint $table) {
            $table->dropColumn(['wastage', 'wastage_value']);
        });
        Schema::table('bar_stock_takings', function (Blueprint $table) {
            $table->dropColumn('total_wastage_value');
        });
    }
};
