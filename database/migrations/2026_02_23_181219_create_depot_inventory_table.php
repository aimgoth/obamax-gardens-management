<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('depot_inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drink_id')->constrained('drinks')->cascadeOnDelete();
            $table->integer('crates_received')->default(0);
            $table->integer('bottles_received'); // Total bottles received
            $table->decimal('cost_per_crate', 10, 2)->nullable(); // Purchase cost (optional)
            $table->date('date_received');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('depot_inventory');
    }
};
