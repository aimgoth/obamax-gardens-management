<?php

namespace App\Http\Controllers;

use App\Models\MonthlySummary;
use App\Models\BarDailyClosing;
use App\Models\RestaurantDailyReport;
use App\Models\Booking;
use Carbon\Carbon;
use Inertia\Inertia;

class MonthlySummaryController extends Controller
{
    /**
     * Compute totals for a given YYYY-MM month key.
     */
    private function computeMonth(string $month): array
    {
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end   = $start->copy()->endOfMonth();

        $bar = BarDailyClosing::whereBetween('closing_date', [$start, $end])
            ->selectRaw('SUM(cash_collected + momo_collected) as total, COUNT(*) as cnt')
            ->first();

        $restaurant = RestaurantDailyReport::whereBetween('report_date', [$start, $end])
            ->selectRaw('SUM(total_cash) as total, COUNT(*) as cnt')
            ->first();

        $hotel = Booking::whereBetween('date_recorded', [$start, $end])
            ->selectRaw('SUM(amount_paid) as total, COUNT(DISTINCT date_recorded) as cnt')
            ->first();

        $barRev  = round((float) ($bar->total ?? 0), 2);
        $restRev = round((float) ($restaurant->total ?? 0), 2);
        $hotelRev = round((float) ($hotel->total ?? 0), 2);

        return [
            'month'               => $month,
            'bar_revenue'         => $barRev,
            'restaurant_revenue'  => $restRev,
            'hotel_revenue'       => $hotelRev,
            'total_revenue'       => round($barRev + $restRev + $hotelRev, 2),
            'bar_closings'        => (int) ($bar->cnt ?? 0),
            'restaurant_reports'  => (int) ($restaurant->cnt ?? 0),
            'hotel_closings'      => (int) ($hotel->cnt ?? 0),
        ];
    }

    /**
     * Auto-save any completed past months that aren't yet archived.
     */
    private function autoArchivePastMonths(): void
    {
        $currentMonth = Carbon::now()->format('Y-m');

        // Find the earliest month with any data
        $earliest = collect([
            BarDailyClosing::min('closing_date'),
            RestaurantDailyReport::min('report_date'),
            Booking::min('date_recorded'),
        ])->filter()->min();

        if (!$earliest) return;

        $cursor = Carbon::parse($earliest)->startOfMonth();
        $limit  = Carbon::now()->subMonth()->startOfMonth(); // last complete month

        while ($cursor->lte($limit)) {
            $key = $cursor->format('Y-m');
            if (!MonthlySummary::where('month', $key)->exists()) {
                MonthlySummary::create($this->computeMonth($key));
            }
            $cursor->addMonth();
        }
    }

    public function index()
    {
        // Auto-archive all past completed months
        $this->autoArchivePastMonths();

        // Current (ongoing) month — live from DB
        $currentMonthKey  = Carbon::now()->format('Y-m');
        $currentMonthLive = $this->computeMonth($currentMonthKey);

        // All archived months (newest first)
        $archived = MonthlySummary::orderByDesc('month')->get();

        return Inertia::render('Archive/Monthly', [
            'currentMonth' => $currentMonthLive,
            'archived'     => $archived,
        ]);
    }
}
