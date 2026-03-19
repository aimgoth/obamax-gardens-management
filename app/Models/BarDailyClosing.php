<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BarDailyClosing extends Model
{
    use HasFactory;

    protected $fillable = [
        'worker_id', 'block', 'closing_date', 'cash_collected', 'momo_collected', 'notes',
    ];

    protected $casts = [
        'closing_date'   => 'date:Y-m-d',
        'cash_collected' => 'decimal:2',
        'momo_collected' => 'decimal:2',
    ];

    protected $appends = ['total_collected'];

    public function getTotalCollectedAttribute()
    {
        return round((float)$this->cash_collected + (float)$this->momo_collected, 2);
    }

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}
