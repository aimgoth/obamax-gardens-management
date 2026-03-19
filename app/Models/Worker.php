<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Worker extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'role', 'department', 'block', 'phone', 'is_active', 'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function barIssuances()
    {
        return $this->hasMany(BarIssuance::class);
    }

    public function barStockTakings()
    {
        return $this->hasMany(BarStockTaking::class);
    }

    public function barDailyClosings()
    {
        return $this->hasMany(BarDailyClosing::class);
    }

    // Scope: active workers
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
