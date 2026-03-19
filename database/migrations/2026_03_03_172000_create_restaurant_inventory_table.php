<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tracked_item_id')->constrained('tracked_items')->cascadeOnDelete();
            $table->decimal('quantity_received', 10, 2); // kg for rice, pieces for fish/meat
            $table->string('unit', 50)->default('kg');   // kg, pieces, bags
            $table->decimal('cost', 10, 2)->nullable();  // optional purchase cost
            $table->date('date_received');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_inventory');
    }
};
