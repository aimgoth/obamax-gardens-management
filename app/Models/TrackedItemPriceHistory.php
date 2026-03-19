<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TrackedItemPriceHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracked_item_id', 'old_price', 'new_price', 'price_type', 'effective_date',
    ];

    protected $casts = [
        'effective_date' => 'date:Y-m-d',
        'old_price'      => 'decimal:2',
        'new_price'      => 'decimal:2',
    ];

    public function trackedItem()
    {
        return $this->belongsTo(TrackedItem::class);
    }
}
