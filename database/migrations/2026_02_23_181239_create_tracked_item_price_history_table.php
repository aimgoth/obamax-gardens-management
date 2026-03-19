<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tracked_item_price_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tracked_item_id')->constrained('tracked_items')->cascadeOnDelete();
            $table->string('price_field'); // which price changed: price_per_plate, price_small, price_medium, price_large, price_per_unit
            $table->decimal('old_price', 10, 2);
            $table->decimal('new_price', 10, 2);
            $table->date('effective_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracked_item_price_history');
    }
};
