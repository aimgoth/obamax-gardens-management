<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bar_stock_takings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('worker_id')->constrained('workers')->cascadeOnDelete();
            $table->foreignId('drink_id')->constrained('drinks')->cascadeOnDelete();
            $table->string('block'); // Block A, B, C
            $table->date('period_start');
            $table->date('period_end'); // The date stock taking is done
            $table->integer('opening_stock_bottles'); // From last stock taking closing
            $table->integer('issued_during_period'); // Total bottles issued in this period
            $table->integer('closing_stock_bottles'); // Physically counted today
            $table->integer('quantity_sold'); // Auto: opening + issued - closing
            $table->decimal('expected_revenue', 10, 2); // Auto-calculated (handles multiple price periods)
            $table->decimal('cash_collected', 10, 2)->default(0);
            $table->decimal('momo_collected', 10, 2)->default(0);
            $table->decimal('total_collected', 10, 2)->default(0);
            $table->decimal('shortfall', 10, 2)->default(0); // expected - collected
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bar_stock_takings');
    }
};
