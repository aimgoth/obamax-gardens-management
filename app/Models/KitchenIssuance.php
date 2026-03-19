<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class KitchenIssuance extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracked_item_id', 'quantity_issued', 'expected_plates', 'unit', 'size', 'issued_date', 'notes',
    ];

    protected $casts = [
        'issued_date'     => 'date:Y-m-d',
        'quantity_issued' => 'decimal:2',
        'expected_plates' => 'integer',
    ];

    public function trackedItem()
    {
        return $this->belongsTo(TrackedItem::class);
    }
}
