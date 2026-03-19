<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drink_price_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drink_id')->constrained('drinks')->cascadeOnDelete();
            $table->decimal('old_price', 10, 2);
            $table->decimal('new_price', 10, 2);
            $table->date('effective_date'); // Price applies from this date onwards for new issuances
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drink_price_history');
    }
};
