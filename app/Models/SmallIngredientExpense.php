<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SmallIngredientExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'expense_date', 'amount', 'description',
    ];

    protected $casts = [
        'expense_date' => 'date:Y-m-d',
        'amount'       => 'decimal:2',
    ];
}
