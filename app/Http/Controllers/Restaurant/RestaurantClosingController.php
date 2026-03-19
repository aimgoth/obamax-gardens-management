<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\RestaurantDailyClosing;
use App\Models\RestaurantDailyReport;
use App\Models\RestaurantInventory;
use App\Models\SmallIngredientExpense;
use App\Models\TrackedItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class RestaurantClosingController extends Controller
{
    public function index()
    {
        $items = TrackedItem::active()->orderBy('item_type')->orderBy('name')->get();

        $closings = RestaurantDailyClosing::with('trackedItem')
            ->orderByDesc('closing_date')->orderByDesc('id')->take(100)->get();

        $ingredients = SmallIngredientExpense::orderByDesc('expense_date')->take(50)->get();

        $today = Carbon::today()->toDateString();
        $todayCount = RestaurantDailyClosing::whereDate('closing_date', $today)->count();
        $todayIngredients = SmallIngredientExpense::where('expense_date', $today)->value('amount') ?? 0;

        // Build day summary for the daily report tab
        $daySummary = $this->buildDaySummary($today, $items);

        // Recent submitted reports
        $reports = RestaurantDailyReport::orderByDesc('report_date')->take(30)->get();
        $todayReport = RestaurantDailyReport::where('report_date', $today)->first();

        return Inertia::render('Restaurant/Closing/Index', [
            'items'           => $items,
            'closings'        => $closings,
            'ingredients'     => $ingredients,
            'today'           => $today,
            'todayCount'      => $todayCount,
            'todayIngredients'=> $todayIngredients,
            'daySummary'      => $daySummary,
            'reports'         => $reports,
            'todayReport'     => $todayReport,
        ]);
    }

    private function buildDaySummary(string $date, $items): array
    {
        $closings = RestaurantDailyClosing::with('trackedItem')
            ->whereDate('closing_date', $date)->get();

        $riceItems    = [];
        $portionItems = [];

        foreach ($items as $item) {
            $itemClosings = $closings->where('tracked_item_id', $item->id);

            if ($item->item_type === 'Rice') {
                $totalPlates = $itemClosings->sum('plates_sold');
                if ($totalPlates > 0) {
                    $revenue = $item->price_per_plate ? $totalPlates * $item->price_per_plate : null;
                    $riceItems[] = [
                        'id'          => $item->id,
                        'name'        => $item->name,
                        'plates_sold' => (int) $totalPlates,
                        'price_per_plate' => $item->price_per_plate,
                        'revenue'     => $revenue,
                    ];
                }
            } else {
                $sizes = [];
                $totalSold    = 0;
                $totalRevenue = 0;
                foreach (['Small', 'Medium', 'Large'] as $size) {
                    $sold  = (int) $itemClosings->where('size_category', $size)->sum('plates_sold');
                    $price = match($size) {
                        'Small'  => (float) ($item->price_small  ?? 0),
                        'Medium' => (float) ($item->price_medium ?? 0),
                        'Large'  => (float) ($item->price_large  ?? 0),
                    };
                    // stock remaining (all-time received minus all-time sold for this size)
                    $received  = (int) RestaurantInventory::where('tracked_item_id', $item->id)
                        ->where('size', $size)->sum('quantity_received');
                    $totalSoldAllTime = (int) RestaurantDailyClosing::where('tracked_item_id', $item->id)
                        ->where('size_category', $size)->sum('plates_sold');
                    $remaining = max(0, $received - $totalSoldAllTime);

                    $revenue = $price > 0 ? $sold * $price : null;
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
                if ($totalSold > 0) {
                    $portionItems[] = [
                        'id'            => $item->id,
                        'name'          => $item->name,
                        'item_type'     => $item->item_type,
                        'sizes'         => $sizes,
                        'total_sold'    => $totalSold,
                        'total_revenue' => $totalRevenue > 0 ? $totalRevenue : null,
                    ];
                }
            }
        }

        $ingredientCost = (float) (SmallIngredientExpense::where('expense_date', $date)->value('amount') ?? 0);
        $totalCalculatedRevenue = array_sum(array_column($riceItems, 'revenue'))
            + array_sum(array_column($portionItems, 'total_revenue'));

        return [
            'date'            => $date,
            'rice_items'      => $riceItems,
            'portion_items'   => $portionItems,
            'ingredient_cost' => $ingredientCost,
            'total_calculated_revenue' => $totalCalculatedRevenue,
        ];
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tracked_item_id' => 'required|exists:tracked_items,id',
            'size_category'   => 'nullable|string|max:50',
            'closing_date'    => 'required|date',
            'plates_sold'     => 'required|integer|min:0',
            'notes'           => 'nullable|string',
        ]);

        // Check duplicate
        $exists = RestaurantDailyClosing::where('tracked_item_id', $validated['tracked_item_id'])
            ->where('size_category', $validated['size_category'])
            ->where('closing_date', $validated['closing_date'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['closing_date' => 'A closing for this item/size already exists for this date.']);
        }

        RestaurantDailyClosing::create($validated);
        return back()->with('success', 'Restaurant closing recorded.');
    }

    public function storeIngredients(Request $request)
    {
        $validated = $request->validate([
            'expense_date' => 'required|date',
            'amount'       => 'required|numeric|min:0',
            'description'  => 'nullable|string',
        ]);

        SmallIngredientExpense::updateOrCreate(
            ['expense_date' => $validated['expense_date']],
            ['amount' => $validated['amount'], 'description' => $validated['description'] ?? null]
        );

        return back()->with('success', 'Ingredient expense recorded.');
    }

    public function submitReport(Request $request)
    {
        $validated = $request->validate([
            'report_date' => 'required|date',
            'total_cash'  => 'required|numeric|min:0',
            'notes'       => 'nullable|string',
        ]);

        RestaurantDailyReport::updateOrCreate(
            ['report_date' => $validated['report_date']],
            ['total_cash' => $validated['total_cash'], 'notes' => $validated['notes'] ?? null]
        );

        return back()->with('success', 'Daily report submitted for ' . $validated['report_date'] . '.');
    }
}
