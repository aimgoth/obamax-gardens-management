<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HotelDailyClosing extends Model
{
    use HasFactory;

    protected $fillable = [
        'closing_date', 'expected_revenue', 'cash_collected', 'momo_collected', 'shortfall', 'notes',
    ];

    protected $casts = [
        'closing_date'     => 'date:Y-m-d',
        'expected_revenue' => 'decimal:2',
        'cash_collected'   => 'decimal:2',
        'momo_collected'   => 'decimal:2',
        'total_collected'  => 'decimal:2',
        'shortfall'        => 'decimal:2',
    ];
}
