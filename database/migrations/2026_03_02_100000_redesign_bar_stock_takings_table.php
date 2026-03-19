<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop old table and recreate with new schema
        Schema::dropIfExists('bar_stock_takings');

        Schema::create('bar_stock_takings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('worker_id')->constrained('workers')->cascadeOnDelete();
            $table->string('block');
            $table->date('stock_date');
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('total_expected_revenue', 12, 2)->default(0);
            $table->decimal('total_collected', 12, 2)->default(0);
            $table->decimal('shortfall', 12, 2)->default(0); // negative = surplus
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('bar_stock_taking_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_taking_id')->constrained('bar_stock_takings')->cascadeOnDelete();
            $table->foreignId('drink_id')->constrained('drinks')->cascadeOnDelete();
            $table->integer('opening_stock')->default(0);
            $table->integer('issued_during_period')->default(0);
            $table->integer('closing_stock')->default(0);
            $table->integer('qty_sold')->default(0);
            $table->decimal('expected_revenue', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bar_stock_taking_items');
        Schema::dropIfExists('bar_stock_takings');
    }
};
