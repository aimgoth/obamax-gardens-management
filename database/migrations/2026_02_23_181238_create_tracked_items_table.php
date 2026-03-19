<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tracked_items', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. Rice, Tilapia, Chicken, Cooking Oil
            $table->enum('item_type', ['rice_bag', 'fish_meat', 'other']);
            // For rice/bag items
            $table->decimal('kilos_per_bag', 8, 2)->nullable();
            $table->integer('plates_per_bag')->nullable();
            $table->decimal('price_per_plate', 10, 2)->nullable();
            // For fish/meat items (3 sizes)
            $table->decimal('price_small', 10, 2)->nullable();
            $table->decimal('price_medium', 10, 2)->nullable();
            $table->decimal('price_large', 10, 2)->nullable();
            // For other items (oil, etc.)
            $table->string('unit_of_measurement')->nullable(); // Litre, Gallon, etc.
            $table->decimal('price_per_unit', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracked_items');
    }
};
