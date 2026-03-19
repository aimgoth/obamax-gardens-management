<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->string('guest_name');
            $table->string('guest_phone')->nullable();
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->integer('number_of_nights'); // Auto-calculated from dates
            $table->decimal('price_per_night', 10, 2); // Price at time of booking
            $table->decimal('total_bill', 10, 2); // Auto: nights * price_per_night
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->enum('payment_method', ['cash', 'momo', 'mixed'])->default('cash');
            $table->date('date_recorded'); // When manager entered this booking
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
