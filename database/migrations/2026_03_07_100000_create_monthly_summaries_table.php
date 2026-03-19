<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_summaries', function (Blueprint $table) {
            $table->id();
            $table->string('month', 7); // YYYY-MM
            $table->decimal('bar_revenue', 12, 2)->default(0);
            $table->decimal('restaurant_revenue', 12, 2)->default(0);
            $table->decimal('hotel_revenue', 12, 2)->default(0);
            $table->decimal('total_revenue', 12, 2)->default(0);
            $table->integer('bar_closings')->default(0);
            $table->integer('restaurant_reports')->default(0);
            $table->integer('hotel_closings')->default(0);
            $table->timestamps();

            $table->unique('month');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_summaries');
    }
};
