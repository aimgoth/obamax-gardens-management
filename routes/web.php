<?php

use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use App\Http\Controllers\AssistantController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\WorkerController;
use App\Http\Controllers\Bar\DrinkController;
use App\Http\Controllers\Bar\DepotController;
use App\Http\Controllers\Bar\BarIssuanceController;
use App\Http\Controllers\Bar\BarStockTakingController;
use App\Http\Controllers\Bar\BarClosingController;
use App\Http\Controllers\Restaurant\TrackedItemController;
use App\Http\Controllers\Restaurant\KitchenIssuanceController;
use App\Http\Controllers\Restaurant\RestaurantClosingController;
use App\Http\Controllers\Restaurant\RestaurantInventoryController;
use App\Http\Controllers\Hotel\HotelController;
use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\MonthlySummaryController;
use App\Http\Controllers\ProfileController;

// Redirect root to login
Route::get('/', fn() => redirect()->route('login'));

// Desktop app download routes (works even if public path layout differs)
Route::get('/download/desktop/zip', function (): BinaryFileResponse {
    $candidates = [
        public_path('downloads/Obamax_Gardens_App.zip'),
        base_path('public/downloads/Obamax_Gardens_App.zip'),
        base_path('downloads/Obamax_Gardens_App.zip'),
    ];

    foreach ($candidates as $file) {
        if (is_file($file)) {
            return response()->download($file, 'Obamax_Gardens_App.zip');
        }
    }

    abort(404, 'Desktop ZIP package not found on server.');
})->name('download.desktop.zip');

Route::get('/download/desktop/exe', function (): BinaryFileResponse {
    $candidates = [
        public_path('downloads/Obamax_Gardens_Setup.exe'),
        base_path('public/downloads/Obamax_Gardens_Setup.exe'),
        base_path('downloads/Obamax_Gardens_Setup.exe'),
    ];

    foreach ($candidates as $file) {
        if (is_file($file)) {
            return response()->download($file, 'Obamax_Gardens_Setup.exe');
        }
    }

    abort(404, 'Desktop EXE installer not found on server.');
})->name('download.desktop.exe');

Route::get('/download/debug', function () {
    $candidates = [
        public_path('downloads/Obamax_Gardens_App.zip'),
        base_path('public/downloads/Obamax_Gardens_App.zip'),
        base_path('downloads/Obamax_Gardens_App.zip'),
    ];
    $report = [];
    foreach ($candidates as $path) {
        $report[] = $path . ' → ' . (is_file($path) ? '✅ EXISTS' : '❌ NOT FOUND');
    }
    return implode("\n", $report);
});

// Public API endpoint for Assistant (Electron compatible)
Route::middleware(['web'])->post('/assistant/ask', [AssistantController::class, 'ask'])->name('assistant.ask');

// Authenticated Routes
Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Assistant
    Route::get('/assistant', [AssistantController::class, 'index'])->name('assistant.index');

    // Profile
    Route::get('profile', [ProfileController::class, 'index'])->name('profile.index');
    Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    // Workers
    Route::get('workers', [WorkerController::class, 'index'])->name('workers.index');
    Route::post('workers', [WorkerController::class, 'store'])->name('workers.store');
    Route::put('workers/{worker}', [WorkerController::class, 'update'])->name('workers.update');
    Route::patch('workers/{worker}/deactivate', [WorkerController::class, 'deactivate'])->name('workers.deactivate');
    Route::delete('workers/{worker}', [WorkerController::class, 'destroy'])->name('workers.destroy');

    // BAR SYSTEM
    Route::prefix('bar')->name('bar.')->group(function () {
        Route::get('drinks', [DrinkController::class, 'index'])->name('drinks.index');
        Route::post('drinks', [DrinkController::class, 'store'])->name('drinks.store');
        Route::put('drinks/{drink}', [DrinkController::class, 'update'])->name('drinks.update');
        Route::delete('drinks/{drink}', [DrinkController::class, 'destroy'])->name('drinks.destroy');

        Route::get('depot', [DepotController::class, 'index'])->name('depot.index');
        Route::post('depot', [DepotController::class, 'store'])->name('depot.store');
        Route::delete('depot/{depot}', [DepotController::class, 'destroy'])->name('depot.destroy');
        Route::get('depot/report', [DepotController::class, 'report'])->name('depot.report');

        Route::get('issuance', [BarIssuanceController::class, 'index'])->name('issuance.index');
        Route::post('issuance', [BarIssuanceController::class, 'store'])->name('issuance.store');
        Route::delete('issuance/{issuance}', [BarIssuanceController::class, 'destroy'])->name('issuance.destroy');
        Route::get('issuance/report', [BarIssuanceController::class, 'report'])->name('issuance.report');

        Route::get('stocktaking', [BarStockTakingController::class, 'index'])->name('stocktaking.index');
        Route::get('stocktaking/prepare', [BarStockTakingController::class, 'prepare'])->name('stocktaking.prepare');
        Route::post('stocktaking', [BarStockTakingController::class, 'store'])->name('stocktaking.store');
        Route::get('stocktaking/{stocktaking}/report', [BarStockTakingController::class, 'report'])->name('stocktaking.report');

        Route::get('closing', [BarClosingController::class, 'index'])->name('closing.index');
        Route::post('closing', [BarClosingController::class, 'store'])->name('closing.store');
        Route::get('closing/report', [BarClosingController::class, 'report'])->name('closing.report');
        Route::delete('closing/{closing}', [BarClosingController::class, 'destroy'])->name('closing.destroy');
    });

    // RESTAURANT SYSTEM
    Route::prefix('restaurant')->name('restaurant.')->group(function () {
        Route::get('items', [TrackedItemController::class, 'index'])->name('items.index');
        Route::post('items', [TrackedItemController::class, 'store'])->name('items.store');
        Route::put('items/{item}', [TrackedItemController::class, 'update'])->name('items.update');
        Route::delete('items/{item}', [TrackedItemController::class, 'destroy'])->name('items.destroy');

        Route::get('inventory', [RestaurantInventoryController::class, 'index'])->name('inventory.index');
        Route::post('inventory', [RestaurantInventoryController::class, 'store'])->name('inventory.store');
        Route::delete('inventory/{inventory}', [RestaurantInventoryController::class, 'destroy'])->name('inventory.destroy');

        Route::get('issuance', [KitchenIssuanceController::class, 'index'])->name('issuance.index');
        Route::post('issuance', [KitchenIssuanceController::class, 'store'])->name('issuance.store');
        Route::delete('issuance/{issuance}', [KitchenIssuanceController::class, 'destroy'])->name('issuance.destroy');

        Route::get('closing', [RestaurantClosingController::class, 'index'])->name('closing.index');
        Route::post('closing', [RestaurantClosingController::class, 'store'])->name('closing.store');
        Route::post('ingredients', [RestaurantClosingController::class, 'storeIngredients'])->name('ingredients.store');
        Route::post('report', [RestaurantClosingController::class, 'submitReport'])->name('report.store');
    });

    // HOTEL SYSTEM
    Route::prefix('hotel')->name('hotel.')->group(function () {
        Route::get('rooms', [HotelController::class, 'rooms'])->name('rooms.index');
        Route::post('rooms', [HotelController::class, 'storeRoom'])->name('rooms.store');
        Route::put('rooms/{room}', [HotelController::class, 'updateRoom'])->name('rooms.update');

        Route::get('bookings', [HotelController::class, 'bookings'])->name('bookings.index');
        Route::post('bookings', [HotelController::class, 'storeBooking'])->name('bookings.store');

        Route::get('closing', [HotelController::class, 'closing'])->name('closing.index');
        Route::post('closing', [HotelController::class, 'storeClosing'])->name('closing.store');
    });

    // ARCHIVE
    Route::prefix('archive')->name('archive.')->group(function () {
        Route::get('restaurant',            [ArchiveController::class, 'restaurant'])->name('restaurant');
        Route::get('restaurant/{id}/print', [ArchiveController::class, 'printReport'])->name('restaurant.print');
        Route::get('hotel',                 [ArchiveController::class, 'hotel'])->name('hotel');
        Route::get('bar',                   [ArchiveController::class, 'bar'])->name('bar');
        Route::get('monthly',               [MonthlySummaryController::class, 'index'])->name('monthly');
    });
});

use App\Models\User;
use Illuminate\Support\Facades\Hash;

Route::get('/create-admin', function() {
    User::updateOrCreate(
        ['email' => 'admin@obamaxgardens.com'],
        [
            'name' => 'Super Admin',
            'password' => Hash::make('Password123!'),
        ]
    );
    return "Admin created successfully! You can now log in with admin@obamaxgardens.com and Password123!";
});

Route::get('/reset-manager', function() {
    $user = User::updateOrCreate(
        ['email' => 'manager@obamaxgardens.com'],
        [
            'name' => 'Manager',
            'password' => Hash::make('Manager123!'),
        ]
    );
    return "Done! Manager account has been forced to exist. You can now log in with Email: manager@obamaxgardens.com and Password: Manager123!";
});

Route::get('/clear-cache', function() {
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
    return 'Cache/config/routes/views cleared successfully.';
});
