<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_daily_closings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tracked_item_id')->constrained('tracked_items')->cascadeOnDelete();
            $table->string('size_category')->nullable(); // For fish/meat sizes
            $table->date('closing_date');
            $table->decimal('cash_collected', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['tracked_item_id', 'size_category', 'closing_date'], 'rest_closing_unique'); // One closing per item per day
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_daily_closings');
    }
};
