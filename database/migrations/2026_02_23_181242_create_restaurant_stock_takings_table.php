<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_stock_takings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tracked_item_id')->constrained('tracked_items')->cascadeOnDelete();
            $table->string('size_category')->nullable(); // For fish/meat: small, medium, large, or null for others
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('opening_stock', 10, 2); // From last stock taking
            $table->decimal('issued_during_period', 10, 2); // Total issued in this period
            $table->decimal('closing_stock', 10, 2); // Physically counted
            $table->decimal('quantity_sold', 10, 2); // Auto: opening + issued - closing
            $table->decimal('expected_revenue', 10, 2); // Auto-calculated
            $table->decimal('cash_collected', 10, 2)->default(0);
            $table->decimal('shortfall', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_stock_takings');
    }
};
