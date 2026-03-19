<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bar_daily_closings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('worker_id')->constrained('workers')->cascadeOnDelete();
            $table->string('block'); // Block A, B, C
            $table->date('closing_date');
            $table->decimal('cash_collected', 10, 2)->default(0);
            $table->decimal('momo_collected', 10, 2)->default(0);
            $table->decimal('total_collected', 10, 2)->storedAs('cash_collected + momo_collected');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['worker_id', 'block', 'closing_date']); // One closing per bar keeper per day
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bar_daily_closings');
    }
};
