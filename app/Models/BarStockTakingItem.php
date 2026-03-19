<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BarStockTakingItem extends Model
{
    protected $fillable = [
        'stock_taking_id', 'drink_id', 'opening_stock', 'issued_during_period',
        'closing_stock', 'wastage', 'wastage_value', 'qty_sold', 'expected_revenue',
    ];

    protected $casts = [
        'expected_revenue' => 'decimal:2',
        'wastage_value'    => 'decimal:2',
    ];

    public function stockTaking()
    {
        return $this->belongsTo(BarStockTaking::class, 'stock_taking_id');
    }

    public function drink()
    {
        return $this->belongsTo(Drink::class);
    }
}
