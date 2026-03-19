<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drinks', function (Blueprint $table) {
            $table->string('sell_by')->default('bottle')->after('name'); // 'bottle' or 'tot'
            $table->integer('tots_per_bottle')->nullable()->after('bottles_per_crate'); // e.g. 20 tots in a bottle
            $table->decimal('price_per_tot', 10, 2)->nullable()->after('price_per_bottle'); // e.g. GHS 3.00 per tot
        });

        Schema::table('drink_price_history', function (Blueprint $table) {
            $table->string('note')->nullable()->after('effective_date'); // e.g. 'Bottle price change' or 'Tot price change'
        });
    }

    public function down(): void
    {
        Schema::table('drink_price_history', function (Blueprint $table) {
            $table->dropColumn('note');
        });

        Schema::table('drinks', function (Blueprint $table) {
            $table->dropColumn(['sell_by', 'tots_per_bottle', 'price_per_tot']);
        });
    }
};
