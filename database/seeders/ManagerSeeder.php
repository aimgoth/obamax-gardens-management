<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ManagerSeeder extends Seeder
{
    public function run(): void
    {
        // Create the single manager account for Obamax Gardens
        User::updateOrCreate(
            ['email' => 'manager@obamaxgardens.com'],
            [
                'name'              => 'Obamax Manager',
                'email'             => 'manager@obamaxgardens.com',
                'password'          => Hash::make('ObaMax@2024!'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Manager account created:');
        $this->command->info('   Email: manager@obamaxgardens.com');
        $this->command->info('   Password: ObaMax@2024!');
        $this->command->warn('   ⚠️  Please change the password after first login!');
    }
}
