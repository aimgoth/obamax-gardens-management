<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Booking;
use App\Models\HotelDailyClosing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class HotelController extends Controller
{
    public function rooms()
    {
        return Inertia::render('Hotel/Rooms/Index', [
            'rooms' => Room::orderBy('room_number')->get(),
        ]);
    }

    public function storeRoom(Request $request)
    {
        $validated = $request->validate([
            'room_number'     => 'required|string|max:20|unique:rooms,room_number',
            'room_type'       => 'required|in:Standard,Deluxe,Suite,VIP',
            'price_per_night' => 'required|numeric|min:0',
            'description'     => 'nullable|string',
            'image'           => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
        ]);
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('rooms', 'public');
        }
        Room::create($validated);
        return back()->with('success', 'Room added.');
    }

    public function updateRoom(Request $request, Room $room)
    {
        $validated = $request->validate([
            'room_number'     => 'required|string|max:20|unique:rooms,room_number,'.$room->id,
            'room_type'       => 'required|in:Standard,Deluxe,Suite,VIP',
            'price_per_night' => 'required|numeric|min:0',
            'description'     => 'nullable|string',
            'is_active'       => 'boolean',
            'image'           => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
        ]);
        if ($request->hasFile('image')) {
            if ($room->image) {
                Storage::disk('public')->delete($room->image);
            }
            $validated['image'] = $request->file('image')->store('rooms', 'public');
        } else {
            unset($validated['image']);
        }
        $room->update($validated);
        return back()->with('success', 'Room updated.');
    }

    public function bookings()
    {
        $rooms    = Room::active()->orderBy('room_number')->get();
        $bookings = Booking::with('room')->orderByDesc('date_recorded')->orderByDesc('id')->take(100)->get();

        $today = Carbon::today()->toDateString();
        $todayRevenue = Booking::whereDate('date_recorded', $today)->sum('amount_paid');
        $todayCount   = Booking::whereDate('date_recorded', $today)->count();

        return Inertia::render('Hotel/Bookings/Index', [
            'rooms'        => $rooms,
            'bookings'     => $bookings,
            'today'        => $today,
            'todayRevenue' => $todayRevenue,
            'todayCount'   => $todayCount,
        ]);
    }

    public function storeBooking(Request $request)
    {
        $validated = $request->validate([
            'room_id'         => 'required|exists:rooms,id',
            'booking_date'    => 'required|date',
            'number_of_nights'=> 'required|integer|min:1',
            'payment_method'  => 'required|in:Cash,MoMo,Both',
            'amount_paid'     => 'nullable|numeric|min:0',
            'notes'           => 'nullable|string',
        ]);

        $room = Room::findOrFail($validated['room_id']);
        $nights = (int) $validated['number_of_nights'];
        $checkIn  = Carbon::parse($validated['booking_date']);
        $checkOut = $checkIn->copy()->addDays($nights);
        $totalBill = $nights * $room->price_per_night;
        $amountPaid = $validated['amount_paid'] ?? $totalBill;

        Booking::create([
            'room_id'          => $room->id,
            'guest_name'       => 'Walk-in Guest',
            'guest_phone'      => null,
            'check_in_date'    => $checkIn->toDateString(),
            'check_out_date'   => $checkOut->toDateString(),
            'price_per_night'  => $room->price_per_night,
            'number_of_nights' => $nights,
            'total_bill'       => $totalBill,
            'amount_paid'      => $amountPaid,
            'payment_method'   => $validated['payment_method'],
            'date_recorded'    => $validated['booking_date'],
            'notes'            => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Booking recorded. Room #' . $room->room_number);
    }

    public function closing()
    {
        $closings = HotelDailyClosing::orderByDesc('closing_date')->take(100)->get();
        $today    = Carbon::today()->toDateString();

        // Build per-date booking summary for the last 30 days
        $bookings = Booking::with('room')
            ->orderByDesc('date_recorded')
            ->take(200)
            ->get();

        $bookingsByDate = $bookings->groupBy(fn($b) => $b->date_recorded->format('Y-m-d'))
            ->map(function ($dayBookings, $date) {
                return [
                    'date'     => $date,
                    'total'    => (float) $dayBookings->sum('amount_paid'),
                    'count'    => $dayBookings->count(),
                    'bookings' => $dayBookings->map(fn($b) => [
                        'id'       => $b->id,
                        'room'     => $b->room?->room_number,
                        'nights'   => $b->number_of_nights,
                        'amount'   => (float) $b->amount_paid,
                        'method'   => $b->payment_method,
                        'notes'    => $b->notes,
                    ])->values(),
                ];
            })->values();

        return Inertia::render('Hotel/Closing/Index', [
            'closings'      => $closings,
            'bookingsByDate'=> $bookingsByDate,
            'today'         => $today,
        ]);
    }

    public function storeClosing(Request $request)
    {
        $validated = $request->validate([
            'closing_date'    => 'required|date|unique:hotel_daily_closings,closing_date',
            'cash_collected'  => 'required|numeric|min:0',
            'notes'           => 'nullable|string',
        ]);

        // Auto-compute expected revenue from bookings for this date
        $expectedRevenue = (float) Booking::whereDate('date_recorded', $validated['closing_date'])
            ->sum('amount_paid');

        $shortfall = max(0, $expectedRevenue - $validated['cash_collected']);

        HotelDailyClosing::create([
            'closing_date'    => $validated['closing_date'],
            'expected_revenue'=> $expectedRevenue,
            'cash_collected'  => $validated['cash_collected'],
            'momo_collected'  => 0,
            'total_collected' => $validated['cash_collected'],
            'shortfall'       => $shortfall,
            'notes'           => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Hotel closing recorded.');
    }
}
