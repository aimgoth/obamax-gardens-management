<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('small_ingredient_expenses', function (Blueprint $table) {
            $table->id();
            $table->date('expense_date');
            $table->decimal('amount', 10, 2);
            $table->text('notes')->nullable(); // Optional description of what was bought
            $table->timestamps();

            $table->unique('expense_date'); // One entry per day
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('small_ingredient_expenses');
    }
};
