<?php

namespace App\Http\Controllers;

use App\Models\BarDailyClosing;
use App\Models\Booking;
use App\Models\HotelDailyClosing;
use App\Models\RestaurantDailyClosing;
use App\Models\RestaurantDailyReport;
use App\Models\RestaurantInventory;
use App\Models\SmallIngredientExpense;
use App\Models\TrackedItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class ArchiveController extends Controller
{
    // ─── Restaurant Reports ──────────────────────────────────────────────────

    public function restaurant()
    {
        $reports = RestaurantDailyReport::orderByDesc('report_date')->get();
        $items   = TrackedItem::active()->orderBy('item_type')->orderBy('name')->get();

        $archiveData = $reports->map(function ($report) use ($items) {
            $date    = $report->report_date->format('Y-m-d');
            $summary = $this->buildRestaurantSummary($date, $items);
            return [
                'id'         => $report->id,
                'date'       => $date,
                'total_cash' => (float) $report->total_cash,
                'notes'      => $report->notes,
                'summary'    => $summary,
            ];
        });

        return Inertia::render('Archive/Restaurant', [
            'reports' => $archiveData,
        ]);
    }

    private function buildRestaurantSummary(string $date, $items): array
    {
        // Sales closing entries recorded ON this specific date
        $closings = RestaurantDailyClosing::with('trackedItem')
            ->whereDate('closing_date', $date)->get();

        $riceItems    = [];
        $portionItems = [];

        foreach ($items as $item) {
            $itemClosings = $closings->where('tracked_item_id', $item->id);

            if ($item->item_type === 'Rice') {
                $platesToday = (int) $itemClosings->sum('plates_sold');
                $revenue     = ($item->price_per_plate && $platesToday > 0)
                    ? round($platesToday * $item->price_per_plate, 2)
                    : null;

                // kg received up to this report date (for remaining stock calc)
                $kgReceivedToDate = (float) RestaurantInventory::where('tracked_item_id', $item->id)
                    ->whereDate('date_received', '<=', $date)
                    ->sum('quantity_received');

                // Bags received THIS month only
                $kgThisMonth  = (float) RestaurantInventory::where('tracked_item_id', $item->id)
                    ->whereYear('date_received', substr($date, 0, 4))
                    ->whereMonth('date_received', (int) substr($date, 5, 2))
                    ->sum('quantity_received');
                $bagsThisMonth = ($item->kilos_per_bag > 0)
                    ? round($kgThisMonth / (float) $item->kilos_per_bag, 2)
                    : null;

                // Total plates sold up to and including this date
                $totalSoldToDate = (int) RestaurantDailyClosing::where('tracked_item_id', $item->id)
                    ->whereDate('closing_date', '<=', $date)
                    ->sum('plates_sold');

                // Plates sold within the same month as this report
                $platesThisMonth = (int) RestaurantDailyClosing::where('tracked_item_id', $item->id)
                    ->whereYear('closing_date', substr($date, 0, 4))
                    ->whereMonth('closing_date', (int) substr($date, 5, 2))
                    ->sum('plates_sold');

                // Convert plates sold back to kg to calculate remaining kg/plates
                $remainingPlates = 0;
                $remainingKg     = 0;
                $platesPerKg     = 0;
                if ($item->kilos_per_bag > 0 && $item->plates_per_bag > 0) {
                    $platesPerKg = (float) $item->plates_per_bag / (float) $item->kilos_per_bag;
                    $kgUsed      = $totalSoldToDate / $platesPerKg;
                    $remainingKg = max(0, round($kgReceivedToDate - $kgUsed, 2));
                    $remainingPlates = (int) round($remainingKg * $platesPerKg);
                }

                $riceItems[] = [
                    'id'               => $item->id,
                    'name'             => $item->name,
                    'plates_sold'      => $platesToday,
                    'price_per_plate'  => (float) ($item->price_per_plate ?? 0),
                    'revenue'          => $revenue,
                    'bags_this_month'  => $bagsThisMonth,
                    'plates_this_month'=> $platesThisMonth,
                    'remaining_kg'     => $remainingKg,
                    'remaining_plates' => $remainingPlates,
                    'plates_per_kg'    => round($platesPerKg, 1),
                    'kilos_per_bag'    => (float) ($item->kilos_per_bag ?? 0),
                ];
            } else {
                $sizes        = [];
                $totalSold    = 0;
                $totalRevenue = 0;

                foreach (['Small', 'Medium', 'Large'] as $size) {
                    $sold  = (int) $itemClosings->where('size_category', $size)->sum('plates_sold');
                    $price = match ($size) {
                        'Small'  => (float) ($item->price_small  ?? 0),
                        'Medium' => (float) ($item->price_medium ?? 0),
                        'Large'  => (float) ($item->price_large  ?? 0),
                    };

                    // Received on or before this report date
                    $received = (int) RestaurantInventory::where('tracked_item_id', $item->id)
                        ->where('size', $size)
                        ->whereDate('date_received', '<=', $date)
                        ->sum('quantity_received');

                    // Total sold up to AND including this date (stock remaining at end of this day)
                    $totalSoldUpToDate = (int) RestaurantDailyClosing::where('tracked_item_id', $item->id)
                        ->where('size_category', $size)
                        ->whereDate('closing_date', '<=', $date)
                        ->sum('plates_sold');

                    $remaining = max(0, $received - $totalSoldUpToDate);
                    $revenue   = ($price > 0 && $sold > 0) ? round($sold * $price, 2) : null;

                    $sizes[] = [
                        'size'      => $size,
                        'sold'      => $sold,
                        'price'     => $price > 0 ? $price : null,
                        'revenue'   => $revenue,
                        'received'  => $received,
                        'remaining' => $remaining,
                    ];
                    $totalSold    += $sold;
                    $totalRevenue += $revenue ?? 0;
                }

                // Always include all active tracked portion items
                $portionItems[] = [
                    'id'            => $item->id,
                    'name'          => $item->name,
                    'item_type'     => $item->item_type,
                    'sizes'         => $sizes,
                    'total_sold'    => $totalSold,
                    'total_revenue' => $totalRevenue > 0 ? round($totalRevenue, 2) : null,
                ];
            }
        }

        $ingredientCost = (float) (SmallIngredientExpense::where('expense_date', $date)->value('amount') ?? 0);
        $calcRevenue    = array_sum(array_column($riceItems, 'revenue'))
                        + array_sum(array_column($portionItems, 'total_revenue'));

        // Inventory deliveries recorded on this exact date
        $inventoryAdditions = RestaurantInventory::with('trackedItem')
            ->whereDate('date_received', $date)
            ->orderBy('id')
            ->get()
            ->map(fn ($inv) => [
                'item_name' => $inv->trackedItem?->name ?? 'Unknown',
                'item_type' => $inv->trackedItem?->item_type ?? '',
                'size'      => $inv->size,
                'quantity'  => (float) $inv->quantity_received,
                'unit'      => $inv->unit,
                'cost'      => (float) ($inv->cost ?? 0),
                'notes'     => $inv->notes,
            ])
            ->values()
            ->toArray();

        return [
            'rice_items'            => $riceItems,
            'portion_items'         => $portionItems,
            'ingredient_cost'       => $ingredientCost,
            'calc_revenue'          => round($calcRevenue, 2),
            'inventory_additions'   => $inventoryAdditions,
        ];
    }

    // ─── Print Single Restaurant Report ─────────────────────────────────────

    public function printReport(int $id)
    {
        $report  = RestaurantDailyReport::findOrFail($id);
        $items   = TrackedItem::active()->orderBy('item_type')->orderBy('name')->get();
        $date    = $report->report_date->format('Y-m-d');
        $summary = $this->buildRestaurantSummary($date, $items);

        $logoPath   = public_path('logo.png');
        if (!file_exists($logoPath)) $logoPath = public_path('logo.jpg');
        $logoBase64 = file_exists($logoPath)
            ? 'data:image/' . (str_ends_with($logoPath, '.png') ? 'png' : 'jpeg') . ';base64,' . base64_encode(file_get_contents($logoPath))
            : null;

        $pdf = Pdf::loadView('archive.restaurant-print', [
            'report'     => $report,
            'date'       => $date,
            'summary'    => $summary,
            'logoBase64' => $logoBase64,
        ])->setPaper('a4', 'portrait');

        return $pdf->download('restaurant-report-' . $date . '.pdf');
    }

    // ─── Hotel Closings ───────────────────────────────────────────────────────

    public function hotel()
    {
        $closings = HotelDailyClosing::orderByDesc('closing_date')->get();

        $records = $closings->map(function ($c) {
            $date     = $c->closing_date->format('Y-m-d');
            $bookings = Booking::with('room')
                ->whereDate('date_recorded', $date)
                ->get()
                ->map(fn ($b) => [
                    'guest'   => $b->guest_name,
                    'room'    => $b->room?->room_number,
                    'nights'  => $b->number_of_nights,
                    'amount'  => (float) $b->amount_paid,
                    'method'  => $b->payment_method,
                    'checkin' => $b->check_in_date?->format('Y-m-d'),
                    'notes'   => $b->notes,
                ])
                ->values();

            return [
                'id'               => $c->id,
                'date'             => $date,
                'expected_revenue' => (float) $c->expected_revenue,
                'cash_collected'   => (float) $c->cash_collected,
                'shortfall'        => (float) $c->shortfall,
                'notes'            => $c->notes,
                'bookings'         => $bookings,
            ];
        });

        return Inertia::render('Archive/Hotel', [
            'records' => $records,
        ]);
    }

    // ─── Bar Closings ─────────────────────────────────────────────────────────

    public function bar()
    {
        $closings = BarDailyClosing::with('worker')
            ->orderByDesc('closing_date')
            ->orderByDesc('id')
            ->get();

        $records = $closings->map(fn ($c) => [
            'id'             => $c->id,
            'date'           => $c->closing_date->format('Y-m-d'),
            'worker'         => $c->worker?->name,
            'block'          => $c->block,
            'cash_collected' => (float) $c->cash_collected,
            'momo_collected' => (float) $c->momo_collected,
            'total'          => (float) $c->total_collected,
            'notes'          => $c->notes,
        ]);

        return Inertia::render('Archive/Bar', [
            'records' => $records,
        ]);
    }
}
