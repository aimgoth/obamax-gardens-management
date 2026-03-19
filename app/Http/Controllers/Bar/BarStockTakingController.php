<?php

namespace App\Http\Controllers\Bar;

use App\Http\Controllers\Controller;
use App\Models\BarStockTaking;
use App\Models\BarStockTakingItem;
use App\Models\BarIssuance;
use App\Models\BarDailyClosing;
use App\Models\Drink;
use App\Models\Worker;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Carbon\Carbon;

class BarStockTakingController extends Controller
{
    public function index()
    {
        $workers = Worker::active()->where('department', 'Bar')->orderBy('name')->get();
        $blocks  = ['Block A', 'Block B', 'Block C', 'Block D'];

        $stockTakings = BarStockTaking::with(['worker', 'items.drink'])
            ->orderByDesc('stock_date')
            ->orderByDesc('id')
            ->take(200)
            ->get();

        $grouped = $stockTakings->groupBy(fn($s) => $s->worker?->name ?? 'Unknown');

        return Inertia::render('Bar/StockTaking/Index', [
            'workers' => $workers,
            'blocks'  => $blocks,
            'grouped' => $grouped,
        ]);
    }

    /**
     * AJAX: given worker_id + block + date, return drinks with auto-filled data
     */
    public function prepare(Request $request)
    {
        $request->validate([
            'worker_id' => 'required|exists:workers,id',
            'block'     => 'required|string',
            'date'      => 'required|date',
        ]);

        $workerId  = $request->input('worker_id');
        $block     = $request->input('block');
        $stockDate = Carbon::parse($request->input('date'));

        $last = BarStockTaking::where('worker_id', $workerId)
            ->where('block', $block)
            ->where('stock_date', '<', $stockDate->toDateString())
            ->orderByDesc('stock_date')
            ->first();

        $periodStart = $last ? $last->period_end->copy()->addDay() : Carbon::parse('2000-01-01');
        $periodEnd   = $stockDate;

        $drinkIds = BarIssuance::where('worker_id', $workerId)
            ->where('block', $block)
            ->whereBetween('issued_date', [$periodStart->toDateString(), $periodEnd->toDateString()])
            ->pluck('drink_id')
            ->unique();

        if ($drinkIds->isEmpty()) {
            return response()->json([
                'period_start'       => $periodStart->toDateString(),
                'period_end'         => $periodEnd->toDateString(),
                'drinks'             => [],
                'total_collected'    => 0,
                'closing_days_count' => 0,
                'warning'            => 'No drinks were issued to this bar keeper for this block in the detected period.',
            ]);
        }

        $drinks = Drink::whereIn('id', $drinkIds)->orderBy('name')->get();

        $drinkRows = $drinks->map(function (Drink $drink) use ($workerId, $block, $periodStart, $periodEnd, $last) {
            $openingStock = 0;
            if ($last) {
                $prevItem = BarStockTakingItem::where('stock_taking_id', $last->id)
                    ->where('drink_id', $drink->id)
                    ->first();
                $openingStock = $prevItem?->closing_stock ?? 0;
            }

            $issued = BarIssuance::where('drink_id', $drink->id)
                ->where('worker_id', $workerId)
                ->where('block', $block)
                ->whereBetween('issued_date', [$periodStart->toDateString(), $periodEnd->toDateString()])
                ->sum('bottles_issued');

            return [
                'drink_id'             => $drink->id,
                'drink_name'           => $drink->name,
                'bottle_revenue'       => (float) $drink->bottle_revenue,
                'opening_stock'        => $openingStock,
                'issued_during_period' => (int) $issued,
                'closing_stock'        => 0,
            ];
        });

        $closings = BarDailyClosing::where('worker_id', $workerId)
            ->where('block', $block)
            ->whereBetween('closing_date', [$periodStart->toDateString(), $periodEnd->toDateString()])
            ->get();

        $totalCollected   = $closings->sum('cash_collected') + $closings->sum('momo_collected');
        $closingDaysCount = $closings->count();

        return response()->json([
            'period_start'       => $periodStart->toDateString(),
            'period_end'         => $periodEnd->toDateString(),
            'drinks'             => $drinkRows,
            'total_collected'    => round((float) $totalCollected, 2),
            'closing_days_count' => $closingDaysCount,
            'warning'            => $closingDaysCount === 0
                ? 'No daily closing records found for this period. Total collected will be GHS 0.00.'
                : null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'worker_id'            => 'required|exists:workers,id',
            'block'                => 'required|string',
            'stock_date'           => 'required|date',
            'period_start'         => 'required|date',
            'period_end'           => 'required|date',
            'notes'                => 'nullable|string',
            'items'                => 'required|array|min:1',
            'items.*.drink_id'             => 'required|exists:drinks,id',
            'items.*.opening_stock'        => 'required|integer|min:0',
            'items.*.issued_during_period' => 'required|integer|min:0',
            'items.*.closing_stock'        => 'required|integer|min:0',
            'items.*.wastage'              => 'nullable|integer|min:0',
        ]);

        $workerId    = $request->input('worker_id');
        $block       = $request->input('block');
        $periodStart = $request->input('period_start');
        $periodEnd   = $request->input('period_end');

        $totalExpected       = 0;
        $totalWastageBottles = 0;
        $totalWastageValue   = 0;
        $itemsData = [];

        foreach ($request->input('items') as $item) {
            $drink        = Drink::findOrFail($item['drink_id']);
            $wastage      = max(0, (int) ($item['wastage'] ?? 0));
            $qtySold      = max(0, $item['opening_stock'] + $item['issued_during_period'] - $item['closing_stock'] - $wastage);
            $expected     = $qtySold * $drink->bottle_revenue;
            $wastageValue = $wastage * $drink->bottle_revenue;
            $totalExpected       += $expected;
            $totalWastageBottles += $wastage;
            $totalWastageValue   += $wastageValue;

            $itemsData[] = [
                'drink_id'             => $item['drink_id'],
                'opening_stock'        => $item['opening_stock'],
                'issued_during_period' => $item['issued_during_period'],
                'closing_stock'        => $item['closing_stock'],
                'wastage'              => $wastage,
                'wastage_value'        => round($wastageValue, 2),
                'qty_sold'             => $qtySold,
                'expected_revenue'     => round($expected, 2),
            ];
        }

        $closings = BarDailyClosing::where('worker_id', $workerId)
            ->where('block', $block)
            ->whereBetween('closing_date', [$periodStart, $periodEnd])
            ->get();
        $totalCollected = $closings->sum('cash_collected') + $closings->sum('momo_collected');

        $shortfall = round($totalExpected - $totalCollected, 2);

        $stockTaking = BarStockTaking::create([
            'worker_id'              => $workerId,
            'block'                  => $block,
            'stock_date'             => $request->input('stock_date'),
            'period_start'           => $periodStart,
            'period_end'             => $periodEnd,
            'total_expected_revenue' => round($totalExpected, 2),
            'total_wastage_bottles'  => $totalWastageBottles,
            'total_wastage_value'    => round($totalWastageValue, 2),
            'total_collected'        => round((float) $totalCollected, 2),
            'shortfall'              => $shortfall,
            'notes'                  => $request->input('notes'),
        ]);

        foreach ($itemsData as $item) {
            $stockTaking->items()->create($item);
        }

        $msg = "Stock taking recorded. Expected: GHS " . number_format($totalExpected, 2)
             . " | Collected: GHS " . number_format((float) $totalCollected, 2);
        if ($shortfall > 0) {
            $msg .= " | Shortfall: GHS " . number_format($shortfall, 2);
        } elseif ($shortfall < 0) {
            $msg .= " | Surplus: GHS " . number_format(abs($shortfall), 2);
        } else {
            $msg .= " | Balanced ✓";
        }

        return back()->with($shortfall > 0 ? 'warning' : 'success', $msg);
    }

    public function report(BarStockTaking $stocktaking)
    {
        $stocktaking->load(['worker', 'items.drink']);

        $logoPath = public_path('logo.png');
        if (!file_exists($logoPath)) $logoPath = public_path('logo.jpg');
        $logoBase64 = file_exists($logoPath)
            ? 'data:image/' . (str_ends_with($logoPath, '.png') ? 'png' : 'jpeg') . ';base64,' . base64_encode(file_get_contents($logoPath))
            : null;

        $pdf = Pdf::loadView('pdf.stocktaking-report', [
            'stockTaking' => $stocktaking,
            'logoBase64'  => $logoBase64,
        ])->setPaper('a4', 'portrait');

        $filename = 'stocktaking-'
            . $stocktaking->stock_date->format('Y-m-d') . '-'
            . str_replace(' ', '_', $stocktaking->worker?->name ?? 'worker') . '-'
            . str_replace(' ', '_', $stocktaking->block) . '.pdf';

        return $pdf->download($filename);
    }
}
