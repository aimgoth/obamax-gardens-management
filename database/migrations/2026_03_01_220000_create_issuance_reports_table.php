<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issuance_reports', function (Blueprint $table) {
            $table->id();
            $table->date('report_date');
            $table->foreignId('worker_id')->constrained('workers')->cascadeOnDelete();
            $table->string('block');
            $table->integer('total_crates')->default(0);
            $table->integer('total_bottles')->default(0);
            $table->decimal('total_revenue', 12, 2)->default(0);
            $table->string('file_path')->nullable(); // stored PDF path
            $table->timestamps();

            $table->index(['report_date', 'worker_id', 'block']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issuance_reports');
    }
};
