<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IssuanceReport extends Model
{
    protected $fillable = [
        'report_date',
        'worker_id',
        'block',
        'total_crates',
        'total_bottles',
        'total_revenue',
        'file_path',
    ];

    protected $casts = [
        'report_date'   => 'date:Y-m-d',
        'total_revenue' => 'decimal:2',
    ];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}
