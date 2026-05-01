<?php

namespace App\Http\Controllers\Bar;

use App\Http\Controllers\Controller;
use App\Models\BarDailyClosing;
use App\Models\Worker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
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

    public function destroy(BarDailyClosing $closing)
    {
        $closing->delete();
        return back()->with('success', 'Closing record removed.');
    }

    public function report(Request $request)
    {
        $request->validate([
            'date_from' => 'required|date',
            'date_to'   => 'required|date|after_or_equal:date_from',
            'block'     => 'nullable|string',
            'worker_id' => 'nullable|exists:workers,id',
        ]);

        $dateFrom  = Carbon::parse($request->input('date_from'));
        $dateTo    = Carbon::parse($request->input('date_to'));
        $block     = $request->input('block');
        $workerId  = $request->input('worker_id');

        $query = BarDailyClosing::with('worker')
            ->whereBetween('closing_date', [$dateFrom->toDateString(), $dateTo->toDateString()])
            ->orderBy('closing_date')
            ->orderBy('block');

        if ($block) {
            $query->where('block', $block);
        }

        if ($workerId) {
            $query->where('worker_id', $workerId);
        }

        $closings = $query->get()->map(fn ($c) => [
            'date'           => Carbon::parse($c->closing_date)->format('d M Y'),
            'worker'         => $c->worker?->name ?? '—',
            'block'          => $c->block,
            'cash_collected' => (float) $c->cash_collected,
            'momo_collected' => (float) $c->momo_collected,
            'total'          => (float) $c->total_collected,
            'notes'          => $c->notes,
        ]);

        $grandCash  = $closings->sum('cash_collected');
        $grandMomo  = $closings->sum('momo_collected');
        $grandTotal = $closings->sum('total');

        $worker = $workerId ? Worker::find($workerId) : null;

        $logoPath = public_path('logo.png');
        if (!file_exists($logoPath)) {
            $logoPath = public_path('logo.jpg');
        }
        $logoBase64 = file_exists($logoPath)
            ? 'data:image/' . (str_ends_with($logoPath, '.png') ? 'png' : 'jpeg') . ';base64,' . base64_encode(file_get_contents($logoPath))
            : null;

        $pdf = Pdf::loadView('pdf.closing-report', [
            'dateFrom'   => $dateFrom->format('d M Y'),
            'dateTo'     => $dateTo->format('d M Y'),
            'block'      => $block ?: 'All Blocks',
            'workerName' => $worker?->name ?: 'All Bar Keepers',
            'closings'   => $closings,
            'grandCash'  => $grandCash,
            'grandMomo'  => $grandMomo,
            'grandTotal' => $grandTotal,
            'logoBase64' => $logoBase64,
        ])->setPaper('a4', 'portrait');

        $suffix = ($block ? '-' . str_replace(' ', '_', $block) : '') .
                  ($worker ? '-' . str_replace(' ', '_', $worker->name) : '');

        return $pdf->download('closing-report-' . $dateFrom->format('Y-m-d') . '-to-' . $dateTo->format('Y-m-d') . $suffix . '.pdf');
    }
}
