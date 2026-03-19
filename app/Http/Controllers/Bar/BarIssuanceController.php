<?php

namespace App\Http\Controllers\Bar;

use App\Http\Controllers\Controller;
use App\Models\BarIssuance;
use App\Models\Drink;
use App\Models\Worker;
use App\Models\DepotInventory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class BarIssuanceController extends Controller
{
    public function index()
    {
        $drinks  = Drink::active()->orderBy('name')->get();
        $workers = Worker::active()->where('department', 'Bar')->orderBy('name')->get();

        $issuances = BarIssuance::with(['drink', 'worker'])
            ->orderByDesc('issued_date')
            ->orderByDesc('id')
            ->take(100)
            ->get();

        $drinksWithStock = $drinks->map(function ($drink) {
            $received = DepotInventory::where('drink_id', $drink->id)->sum('bottles_received');
            $issued   = BarIssuance::where('drink_id', $drink->id)->sum('bottles_issued');
            $drink->current_stock = max(0, $received - $issued);
            return $drink;
        });

        return Inertia::render('Bar/Issuance/Index', [
            'drinks'    => $drinksWithStock,
            'workers'   => $workers,
            'issuances' => $issuances,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'drink_id'       => 'required|exists:drinks,id',
            'worker_id'      => 'required|exists:workers,id',
            'block'          => 'required|string',
            'bottles_issued' => 'required|integer|min:1',
            'issued_date'    => 'required|date',
            'notes'          => 'nullable|string',
        ]);

        $drink = Drink::findOrFail($validated['drink_id']);
        $expectedRevenue = $validated['bottles_issued'] * $drink->bottle_revenue;

        $received    = DepotInventory::where('drink_id', $drink->id)->sum('bottles_received');
        $totalIssued = BarIssuance::where('drink_id', $drink->id)->sum('bottles_issued');
        $currentStock = $received - $totalIssued;

        if ($validated['bottles_issued'] > $currentStock) {
            return back()->withErrors(['bottles_issued' => "Insufficient depot stock. Available: {$currentStock} bottles."]);
        }

        BarIssuance::create([
            ...$validated,
            'price_per_bottle' => $drink->price_per_bottle,
            'expected_revenue' => $expectedRevenue,
        ]);

        return back()->with('success', "{$validated['bottles_issued']} bottles issued successfully.");
    }

    public function destroy(BarIssuance $issuance)
    {
        $issuance->delete();
        return back()->with('success', 'Issuance record removed.');
    }

    public function report(Request $request)
    {
        $date     = $request->input('date', Carbon::today()->toDateString());
        $workerId = $request->input('worker_id');
        $block    = $request->input('block');

        $worker = Worker::findOrFail($workerId);

        $issuances = BarIssuance::with('drink')
            ->whereDate('issued_date', $date)
            ->where('worker_id', $workerId)
            ->where('block', $block)
            ->orderBy('id')
            ->get();

        $entries = $issuances->groupBy('drink_id')->map(function ($rows) {
            $drink = $rows->first()->drink;
            $pricePerBottle = $drink
                ? ($drink->sell_by === 'tot'
                    ? (float)($drink->tots_per_bottle ?? 0) * (float)($drink->price_per_tot ?? 0)
                    : (float)($drink->price_per_bottle ?? 0))
                : 0;
            $totalBottles = $rows->sum('bottles_issued');
            $bpc = $drink?->bottles_per_crate ?: 1;
            return [
                'drink_name' => $drink?->name ?? 'Unknown',
                'crates'     => $drink ? (int) floor($totalBottles / $bpc) : 0,
                'bottles'    => $totalBottles,
                'total'      => $totalBottles * $pricePerBottle,
            ];
        })->values();

        $grandTotal    = $entries->sum('total');
        $totalCrates   = $entries->sum('crates');
        $totalBottles  = $entries->sum('bottles');
        $formattedDate = Carbon::parse($date)->format('l, d F Y');

        $logoPath = public_path('logo.png');
        if (!file_exists($logoPath)) $logoPath = public_path('logo.jpg');
        $logoBase64 = file_exists($logoPath)
            ? 'data:image/' . (str_ends_with($logoPath, '.png') ? 'png' : 'jpeg') . ';base64,' . base64_encode(file_get_contents($logoPath))
            : null;

        $pdf = Pdf::loadView('pdf.issuance-report', [
            'date'         => $formattedDate,
            'workerName'   => $worker->name,
            'block'        => $block,
            'entries'      => $entries,
            'grandTotal'   => $grandTotal,
            'totalCrates'  => $totalCrates,
            'totalBottles' => $totalBottles,
            'logoBase64'   => $logoBase64,
        ])->setPaper('a4', 'portrait');

        return $pdf->download('issuance-' . $date . '-' . str_replace(' ', '_', $worker->name) . '-' . str_replace(' ', '_', $block) . '.pdf');
    }
}
