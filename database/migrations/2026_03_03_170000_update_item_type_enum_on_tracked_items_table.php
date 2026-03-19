<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alter the enum to match what the application uses
        DB::statement("ALTER TABLE tracked_items MODIFY COLUMN item_type ENUM('Rice','Fish','Meat','Chicken','Stew','Other') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE tracked_items MODIFY COLUMN item_type ENUM('rice_bag','fish_meat','other') NOT NULL");
    }
};
