<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id', 'guest_name', 'guest_phone', 'check_in_date', 'check_out_date',
        'number_of_nights', 'price_per_night', 'total_bill', 'amount_paid',
        'payment_method', 'date_recorded', 'notes',
    ];

    protected $casts = [
        'check_in_date'   => 'date:Y-m-d',
        'check_out_date'  => 'date:Y-m-d',
        'date_recorded'   => 'date:Y-m-d',
        'price_per_night' => 'decimal:2',
        'total_bill'      => 'decimal:2',
        'amount_paid'     => 'decimal:2',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
