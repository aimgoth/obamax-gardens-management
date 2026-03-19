<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Drink extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'sell_by', 'crate_name', 'bottles_per_crate', 'tots_per_bottle',
        'bottle_size', 'price_per_bottle', 'price_per_tot', 'is_active',
    ];

    protected $casts = [
        'price_per_bottle' => 'decimal:2',
        'price_per_tot'    => 'decimal:2',
        'is_active'        => 'boolean',
    ];

    /**
     * Check if this drink is sold by tot (e.g. Alomo Bitters)
     */
    public function isTotDrink(): bool
    {
        return $this->sell_by === 'tot';
    }

    /**
     * Get the selling price (per bottle or per tot depending on sell_by)
     */
    public function getSellingPriceAttribute(): float
    {
        return $this->isTotDrink()
            ? (float) $this->price_per_tot
            : (float) $this->price_per_bottle;
    }

    /**
     * For tot drinks: total revenue from one bottle = tots_per_bottle × price_per_tot
     */
    public function getBottleRevenueAttribute(): float
    {
        if ($this->isTotDrink()) {
            return ($this->tots_per_bottle ?? 0) * (float) ($this->price_per_tot ?? 0);
        }
        return (float) $this->price_per_bottle;
    }

    public function priceHistory()
    {
        return $this->hasMany(DrinkPriceHistory::class);
    }

    public function depotInventory()
    {
        return $this->hasMany(DepotInventory::class);
    }

    public function issuances()
    {
        return $this->hasMany(BarIssuance::class);
    }

    public function stockTakings()
    {
        return $this->hasMany(BarStockTaking::class);
    }

    // Calculate current depot stock
    public function getCurrentDepotStockAttribute(): int
    {
        $received = $this->depotInventory()->sum('bottles_received');
        $issued = $this->issuances()->sum('bottles_issued');
        return max(0, $received - $issued);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
