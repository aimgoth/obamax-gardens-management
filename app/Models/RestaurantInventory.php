<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RestaurantInventory extends Model
{
    use HasFactory;

    protected $table = 'restaurant_inventory';

    protected $fillable = [
        'tracked_item_id', 'quantity_received', 'unit', 'size', 'cost', 'date_received', 'notes',
    ];

    protected $casts = [
        'date_received'     => 'date:Y-m-d',
        'quantity_received' => 'decimal:2',
        'cost'              => 'decimal:2',
    ];

    public function trackedItem()
    {
        return $this->belongsTo(TrackedItem::class);
    }
}
