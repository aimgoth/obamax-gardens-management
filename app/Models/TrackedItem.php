<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TrackedItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'item_type', 'kilos_per_bag', 'plates_per_bag', 'price_per_plate',
        'price_small', 'price_medium', 'price_large', 'unit_of_measurement', 'price_per_unit', 'is_active',
    ];

    protected $casts = [
        'kilos_per_bag'      => 'decimal:2',
        'price_per_plate'    => 'decimal:2',
        'price_small'        => 'decimal:2',
        'price_medium'       => 'decimal:2',
        'price_large'        => 'decimal:2',
        'price_per_unit'     => 'decimal:2',
        'is_active'          => 'boolean',
    ];

    public function priceHistory()
    {
        return $this->hasMany(TrackedItemPriceHistory::class);
    }

    public function kitchenIssuances()
    {
        return $this->hasMany(KitchenIssuance::class);
    }

    public function stockTakings()
    {
        return $this->hasMany(RestaurantStockTaking::class);
    }

    public function dailyClosings()
    {
        return $this->hasMany(RestaurantDailyClosing::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
