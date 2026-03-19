<?php

namespace App\Http\Controllers;

use App\Models\BarDailyClosing;
use App\Models\RestaurantDailyClosing;
use App\Models\RestaurantDailyReport;
use App\Models\Booking;
use App\Models\Worker;
use App\Models\Drink;
use App\Models\DepotInventory;
use App\Models\BarIssuance;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // Today's bar revenue (sum of cash + momo from bar daily closings)
        $todayBarRevenue = BarDailyClosing::whereDate('closing_date', $today)
            ->selectRaw('SUM(cash_collected + momo_collected) as total')
            ->value('total') ?? 0;

        // Today's restaurant revenue (from submitted daily reports)
        $todayRestaurantRevenue = RestaurantDailyReport::whereDate('report_date', $today)
            ->sum('total_cash');

        // Today's hotel revenue
        $todayHotelRevenue = Booking::whereDate('date_recorded', $today)->sum('amount_paid');

        // Monthly totals
        $monthlyBar = BarDailyClosing::where('closing_date', '>=', $thisMonth)
            ->selectRaw('SUM(cash_collected + momo_collected) as total')
            ->value('total') ?? 0;

        $monthlyRestaurant = RestaurantDailyReport::where('report_date', '>=', $thisMonth)
            ->sum('total_cash');

        $monthlyHotel = Booking::where('date_recorded', '>=', $thisMonth)->sum('amount_paid');

        // Active workers count
        $activeWorkers = Worker::active()->count();

        // Low stock alerts — enriched with bottles left, crates, and restock suggestions
        $threeMonthsAgo = Carbon::now()->subMonths(3)->startOfMonth();

        $lowStockDrinks = Drink::active()->get()->filter(function ($drink) use ($threeMonthsAgo) {
            $received = (int) DepotInventory::where('drink_id', $drink->id)->sum('bottles_received');
            $issued   = (int) BarIssuance::where('drink_id', $drink->id)->sum('bottles_issued');
            $current  = $received - $issued;

            if ($current < 24) {
                $monthlyTotals = BarIssuance::where('drink_id', $drink->id)
                    ->where('issued_date', '>=', $threeMonthsAgo)
                    ->selectRaw("DATE_FORMAT(issued_date, '%Y-%m') as month, SUM(bottles_issued) as total")
                    ->groupBy('month')
                    ->pluck('total')
                    ->toArray();

                $bpc = max(1, (int) $drink->bottles_per_crate);
                $avgMonthly = count($monthlyTotals) > 0
                    ? array_sum($monthlyTotals) / count($monthlyTotals)
                    : $bpc * 4; // fallback: 4 crates if no history

                $drink->current_stock_bottles = $current;
                $drink->current_stock_crates  = round($current / $bpc, 1);
                $drink->avg_monthly_bottles   = (int) round($avgMonthly);
                $drink->suggested_add         = max(0, (int) round($avgMonthly * 2 - $current));
                $drink->max_add               = (int) round($avgMonthly * 3);
                return true;
            }
            return false;
        })->values();

        // Low-selling drinks this month — drinks historically issued but barely moving this month
        $thisMonthStart = Carbon::now()->startOfMonth();

        $lowSellingDrinks = Drink::active()->get()->filter(function ($drink) use ($thisMonthStart, $threeMonthsAgo) {
            $totalEverIssued = (int) BarIssuance::where('drink_id', $drink->id)->sum('bottles_issued');
            if ($totalEverIssued === 0) return false;

            $thisMonthIssued = (int) BarIssuance::where('drink_id', $drink->id)
                ->where('issued_date', '>=', $thisMonthStart)
                ->sum('bottles_issued');

            $prevData = BarIssuance::where('drink_id', $drink->id)
                ->where('issued_date', '>=', $threeMonthsAgo)
                ->where('issued_date', '<', $thisMonthStart)
                ->selectRaw("DATE_FORMAT(issued_date, '%Y-%m') as month, SUM(bottles_issued) as total")
                ->groupBy('month')
                ->pluck('total')
                ->toArray();

            $avgPrev = count($prevData) > 0
                ? array_sum($prevData) / count($prevData)
                : 0;

            $isLowSelling = ($avgPrev > 0 && $thisMonthIssued < $avgPrev * 0.5)
                || ($thisMonthIssued === 0 && $totalEverIssued > 0);

            if ($isLowSelling) {
                $drink->this_month_issued  = $thisMonthIssued;
                $drink->avg_prev_monthly   = (int) round($avgPrev);
                return true;
            }
            return false;
        })->values();

        // Recent 7 days bar revenue
        $recentBarRevenue = BarDailyClosing::where('closing_date', '>=', Carbon::now()->subDays(6))
            ->select('closing_date', DB::raw('SUM(cash_collected + momo_collected) as total'))
            ->groupBy('closing_date')
            ->orderBy('closing_date')
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'todayBar'          => round($todayBarRevenue, 2),
                'todayRestaurant'   => round($todayRestaurantRevenue, 2),
                'todayHotel'        => round($todayHotelRevenue, 2),
                'todayTotal'        => round($todayBarRevenue + $todayRestaurantRevenue + $todayHotelRevenue, 2),
                'monthlyBar'        => round($monthlyBar, 2),
                'monthlyRestaurant' => round($monthlyRestaurant, 2),
                'monthlyHotel'      => round($monthlyHotel, 2),
                'monthlyTotal'      => round($monthlyBar + $monthlyRestaurant + $monthlyHotel, 2),
                'activeWorkers'     => $activeWorkers,
                'lowStockCount'     => $lowStockDrinks->count(),
            ],
            'lowStockDrinks'    => $lowStockDrinks->take(5),
            'lowSellingDrinks'  => $lowSellingDrinks->take(6),
            'recentBarRevenue'  => $recentBarRevenue,
            'today'             => $today->toDateString(),
        ]);
    }
}
