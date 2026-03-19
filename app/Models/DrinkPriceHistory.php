<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DrinkPriceHistory extends Model
{
    use HasFactory;

    protected $table = 'drink_price_history';

    protected $fillable = [
        'drink_id', 'old_price', 'new_price', 'effective_date', 'note',
    ];

    protected $casts = [
        'effective_date' => 'date:Y-m-d',
        'old_price'      => 'decimal:2',
        'new_price'      => 'decimal:2',
    ];

    public function drink()
    {
        return $this->belongsTo(Drink::class);
    }
}
