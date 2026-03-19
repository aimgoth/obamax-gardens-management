<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bar_issuances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drink_id')->constrained('drinks')->cascadeOnDelete();
            $table->foreignId('worker_id')->constrained('workers')->cascadeOnDelete();
            $table->string('block'); // Block A, Block B, Block C
            $table->integer('bottles_issued');
            $table->decimal('price_per_bottle', 10, 2); // Price at time of issuance
            $table->decimal('expected_revenue', 10, 2); // Auto-calculated: bottles_issued * price_per_bottle
            $table->date('issued_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bar_issuances');
    }
};
