<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestaurantDailyReport extends Model
{
    protected $fillable = ['report_date', 'total_cash', 'notes'];

    protected $casts = [
        'report_date' => 'date:Y-m-d',
        'total_cash'  => 'decimal:2',
    ];
}
