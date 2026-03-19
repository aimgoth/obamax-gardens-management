<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kitchen_issuances', function (Blueprint $table) {
            // Rename old mismatched columns to match what the app uses
            $table->renameColumn('quantity', 'quantity_issued');
            $table->renameColumn('issue_unit', 'unit');
            // Drop unused columns from the original prototype migration
            $table->dropColumn(['price_at_issue', 'expected_revenue']);
        });

        Schema::table('kitchen_issuances', function (Blueprint $table) {
            // Add expected plates for rice tracking
            $table->integer('expected_plates')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('kitchen_issuances', function (Blueprint $table) {
            $table->dropColumn('expected_plates');
            $table->renameColumn('quantity_issued', 'quantity');
            $table->renameColumn('unit', 'issue_unit');
            $table->decimal('price_at_issue', 10, 2)->default(0);
            $table->decimal('expected_revenue', 10, 2)->default(0);
        });
    }
};
