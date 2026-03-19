<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BarIssuance extends Model
{
    use HasFactory;

    protected $fillable = [
        'drink_id', 'worker_id', 'block', 'bottles_issued', 'price_per_bottle', 'expected_revenue', 'issued_date', 'notes',
    ];

    protected $casts = [
        'price_per_bottle'  => 'decimal:2',
        'expected_revenue'  => 'decimal:2',
        'issued_date'       => 'date:Y-m-d',
    ];

    public function drink()
    {
        return $this->belongsTo(Drink::class);
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}
