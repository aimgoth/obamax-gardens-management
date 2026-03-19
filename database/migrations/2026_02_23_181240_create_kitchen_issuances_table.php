<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kitchen_issuances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tracked_item_id')->constrained('tracked_items')->cascadeOnDelete();
            $table->string('issue_unit'); // bags (rice), pieces_small/medium/large (fish/meat), litres/gallons (other)
            $table->decimal('quantity', 10, 2); // Amount issued
            $table->decimal('price_at_issue', 10, 2); // Price per unit at time of issuance
            $table->decimal('expected_revenue', 10, 2); // Auto-calculated
            $table->date('issued_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kitchen_issuances');
    }
};
