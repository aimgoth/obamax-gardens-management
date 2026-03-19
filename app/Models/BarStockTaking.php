<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BarStockTaking extends Model
{
    use HasFactory;

    protected $fillable = [
        'worker_id', 'block', 'stock_date', 'period_start', 'period_end',
        'total_expected_revenue', 'total_wastage_bottles', 'total_wastage_value',
        'total_collected', 'shortfall', 'notes',
    ];

    protected $casts = [
        'stock_date'             => 'date:Y-m-d',
        'period_start'           => 'date:Y-m-d',
        'period_end'             => 'date:Y-m-d',
        'total_expected_revenue' => 'decimal:2',
        'total_wastage_value'    => 'decimal:2',
        'total_collected'        => 'decimal:2',
        'shortfall'              => 'decimal:2',
    ];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }

    public function items()
    {
        return $this->hasMany(BarStockTakingItem::class, 'stock_taking_id');
    }
}
