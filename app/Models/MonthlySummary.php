<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonthlySummary extends Model
{
    protected $fillable = [
        'month',
        'bar_revenue',
        'restaurant_revenue',
        'hotel_revenue',
        'total_revenue',
        'bar_closings',
        'restaurant_reports',
        'hotel_closings',
    ];

    protected $casts = [
        'bar_revenue'         => 'float',
        'restaurant_revenue'  => 'float',
        'hotel_revenue'       => 'float',
        'total_revenue'       => 'float',
    ];
}
