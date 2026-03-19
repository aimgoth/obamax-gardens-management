<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DepotInventory extends Model
{
    use HasFactory;

    protected $table = 'depot_inventory';

    protected $fillable = [
        'drink_id', 'crates_received', 'bottles_received', 'cost_per_crate', 'date_received', 'notes',
    ];

    protected $casts = [
        'date_received'  => 'date:Y-m-d',
        'cost_per_crate' => 'decimal:2',
    ];

    public function drink()
    {
        return $this->belongsTo(Drink::class);
    }
}
