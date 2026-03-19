<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drinks', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. Star Beer, Malta, Coca Cola
            $table->string('crate_name'); // Name/label for crate type
            $table->integer('bottles_per_crate'); // e.g. 24
            $table->string('bottle_size'); // e.g. 330ml, 600ml, 1 litre
            $table->decimal('price_per_bottle', 10, 2); // Current selling price in GHS
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drinks');
    }
};
