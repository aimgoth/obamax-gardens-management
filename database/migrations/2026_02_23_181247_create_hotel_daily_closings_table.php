<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotel_daily_closings', function (Blueprint $table) {
            $table->id();
            $table->date('closing_date');
            $table->decimal('expected_revenue', 10, 2)->default(0); // Sum of all bookings for the day
            $table->decimal('cash_collected', 10, 2)->default(0);
            $table->decimal('momo_collected', 10, 2)->default(0);
            $table->decimal('total_collected', 10, 2)->storedAs('cash_collected + momo_collected');
            $table->decimal('shortfall', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique('closing_date'); // One closing per day
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_daily_closings');
    }
};
