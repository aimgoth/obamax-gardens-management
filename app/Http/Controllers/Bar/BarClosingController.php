<?php

namespace App\Http\Controllers\Bar;

use App\Http\Controllers\Controller;
use App\Models\BarDailyClosing;
use App\Models\Worker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BarClosingController extends Controller
{
    public function index()
    {
        $workers = Worker::active()->where('department', 'Bar')->orderBy('name')->get();

        $closings = BarDailyClosing::with('worker')
            ->orderByDesc('closing_date')
            ->orderByDesc('id')
            ->take(100)
            ->get();

        // Today's summary
        $today = Carbon::today();
        $todaySummary = BarDailyClosing::whereDate('closing_date', $today)
            ->with('worker')
            ->get()
            ->groupBy('block');

        return Inertia::render('Bar/Closing/Index', [
            'workers'      => $workers,
            'closings'     => $closings,
            'todaySummary' => $todaySummary,
            'today'        => $today->toDateString(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'worker_id'      => 'required|exists:workers,id',
            'block'          => 'required|string',
            'closing_date'   => 'required|date',
            'cash_collected' => 'required|numeric|min:0',
            'momo_collected' => 'required|numeric|min:0',
            'notes'          => 'nullable|string',
        ]);

        // Check for duplicate
        $exists = BarDailyClosing::where('worker_id', $validated['worker_id'])
            ->where('block', $validated['block'])
            ->where('closing_date', $validated['closing_date'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['closing_date' => 'A closing already exists for this bar keeper on this date.']);
        }

        BarDailyClosing::create($validated);

        $total = $validated['cash_collected'] + $validated['momo_collected'];

        return back()->with('success', "Daily closing recorded. Total: GHS " . number_format($total, 2));
    }
}
