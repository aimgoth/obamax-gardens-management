<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('restaurant_inventory', function (Blueprint $table) {
            $table->enum('size', ['Small', 'Medium', 'Large'])->nullable()->after('unit');
        });

        Schema::table('kitchen_issuances', function (Blueprint $table) {
            $table->enum('size', ['Small', 'Medium', 'Large'])->nullable()->after('unit');
        });
    }

    public function down(): void
    {
        Schema::table('restaurant_inventory', function (Blueprint $table) {
            $table->dropColumn('size');
        });
        Schema::table('kitchen_issuances', function (Blueprint $table) {
            $table->dropColumn('size');
        });
    }
};
