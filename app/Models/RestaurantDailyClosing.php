<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RestaurantDailyClosing extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracked_item_id', 'size_category', 'closing_date', 'plates_sold', 'notes',
    ];

    protected $casts = [
        'closing_date' => 'date:Y-m-d',
        'plates_sold'  => 'integer',
    ];

    public function trackedItem()
    {
        return $this->belongsTo(TrackedItem::class);
    }
}
