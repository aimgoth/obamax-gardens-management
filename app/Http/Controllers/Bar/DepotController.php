<?php

namespace App\Http\Controllers\Bar;

use App\Http\Controllers\Controller;
use App\Models\DepotInventory;
use App\Models\Drink;
use App\Models\BarIssuance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class DepotController extends Controller
{
    public function index()
    {
        // Current stock for each drink
        $drinks = Drink::active()->orderBy('name')->get()->map(function ($drink) {
            $received = DepotInventory::where('drink_id', $drink->id)->sum('bottles_received');
            $issued   = BarIssuance::where('drink_id', $drink->id)->sum('bottles_issued');
            $drink->current_stock_bottles = max(0, $received - $issued);
            $drink->current_stock_crates  = $drink->bottles_per_crate > 0
                ? floor($drink->current_stock_bottles / $drink->bottles_per_crate)
                : 0;
            $drink->current_stock_remainder = $drink->current_stock_bottles % $drink->bottles_per_crate;
            return $drink;
        });

        // Recent receipts
        $receipts = DepotInventory::with('drink')->orderByDesc('date_received')->orderByDesc('id')->take(50)->get();

        return Inertia::render('Bar/Depot/Index', [
            'drinks'   => $drinks,
            'receipts' => $receipts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'drink_id'        => 'required|exists:drinks,id',
            'crates_received' => 'required|integer|min:0',
            'extra_bottles'   => 'nullable|integer|min:0',
            'cost_per_crate'  => 'nullable|numeric|min:0',
            'date_received'   => 'required|date',
            'notes'           => 'nullable|string',
        ]);

        $drink = Drink::findOrFail($validated['drink_id']);
        $crates  = (int)$validated['crates_received'];
        $extra   = (int)($validated['extra_bottles'] ?? 0);
        $bottles = ($crates * $drink->bottles_per_crate) + $extra;

        DepotInventory::create([
            'drink_id'        => $validated['drink_id'],
            'crates_received' => $crates,
            'bottles_received'=> $bottles,
            'cost_per_crate'  => $validated['cost_per_crate'] ?? null,
            'date_received'   => $validated['date_received'],
            'notes'           => $validated['notes'] ?? null,
        ]);

        return back()->with('success', "{$bottles} bottles of {$drink->name} added to depot.");
    }

    public function destroy(DepotInventory $depot)
    {
        $depot->delete();
        return back()->with('success', 'Receipt entry removed.');
    }

    public function report(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());

        $entries = DepotInventory::with('drink')
            ->whereDate('date_received', $date)
            ->orderBy('id')
            ->get()
            ->map(function ($entry) {
                $drink = $entry->drink;
                // Use the price from the drink setup (Drink Catalogue)
                // For tot drinks: price per bottle = tots_per_bottle × price_per_tot
                // For regular drinks: price per bottle = price_per_bottle
                if ($drink) {
                    $pricePerBottle = $drink->sell_by === 'tot'
                        ? (float)($drink->tots_per_bottle ?? 0) * (float)($drink->price_per_tot ?? 0)
                        : (float)($drink->price_per_bottle ?? 0);
                    $bottlesPerCrate = (int)($drink->bottles_per_crate ?? 0);
                    $total = $entry->crates_received * $bottlesPerCrate * $pricePerBottle;
                    $priceLabel = 'GHS ' . number_format($pricePerBottle, 2) . '/bottle × ' . $bottlesPerCrate . ' btl/crate';
                } else {
                    $total = 0;
                    $priceLabel = '—';
                }
                return [
                    'drink_name'  => $drink?->name ?? 'Unknown',
                    'crates'      => $entry->crates_received,
                    'total'       => $total,
                ];
            });

        // Group by drink name — combine crates and totals
        $grouped = $entries->groupBy('drink_name')->map(function ($rows, $name) {
            return [
                'drink_name' => $name,
                'crates'     => $rows->sum('crates'),
                'total'      => $rows->sum('total'),
            ];
        })->values();

        $grandTotal = $grouped->sum('total');
        $formattedDate = Carbon::parse($date)->format('l, d F Y');

        // Embed logo as base64 for reliable rendering in DomPDF
        $logoPath = public_path('logo.png');
        if (!file_exists($logoPath)) {
            $logoPath = public_path('logo.jpg');
        }
        $logoBase64 = file_exists($logoPath)
            ? 'data:image/' . (str_ends_with($logoPath, '.png') ? 'png' : 'jpeg') . ';base64,' . base64_encode(file_get_contents($logoPath))
            : null;

        $pdf = Pdf::loadView('pdf.depot-report', [
            'date'        => $formattedDate,
            'rawDate'     => $date,
            'entries'     => $grouped,
            'grandTotal'  => $grandTotal,
            'logoBase64'  => $logoBase64,
        ])->setPaper('a4', 'portrait');

        return $pdf->download('depot-report-' . $date . '.pdf');
    }
}
