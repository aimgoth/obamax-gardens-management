<?php

namespace App\Http\Controllers\Bar;

use App\Http\Controllers\Controller;
use App\Models\Drink;
use App\Models\DrinkPriceHistory;
use App\Models\DepotInventory;
use App\Models\BarIssuance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DrinkController extends Controller
{
    public function index()
    {
        $drinks = Drink::with('priceHistory')->orderBy('name')->get()->map(function ($drink) {
            $received = DepotInventory::where('drink_id', $drink->id)->sum('bottles_received');
            $issued   = BarIssuance::where('drink_id', $drink->id)->sum('bottles_issued');
            $drink->current_depot_stock = max(0, $received - $issued);
            return $drink;
        });

        return Inertia::render('Bar/Drinks/Index', [
            'drinks' => $drinks,
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'name'             => 'required|string|max:255',
            'sell_by'          => 'required|in:bottle,tot',
            'crate_name'       => 'nullable|string|max:255',
            'bottles_per_crate'=> 'required|integer|min:1',
            'bottle_size'      => 'nullable|string|max:50',
        ];

        // Add type-specific validation
        if ($request->input('sell_by') === 'tot') {
            $rules['tots_per_bottle'] = 'required|integer|min:1';
            $rules['price_per_tot']   = 'required|numeric|min:0';
        } else {
            $rules['price_per_bottle'] = 'required|numeric|min:0';
        }

        $validated = $request->validate($rules);

        // Default values for optional fields
        $validated['crate_name'] = $validated['crate_name'] ?? ($validated['name'] . ' Crate');
        $validated['bottle_size'] = $validated['bottle_size'] ?? 'Standard';

        // Clear irrelevant fields based on sell_by type
        if ($validated['sell_by'] === 'tot') {
            $validated['price_per_bottle'] = 0;
        } else {
            $validated['tots_per_bottle'] = null;
            $validated['price_per_tot'] = null;
        }

        Drink::create($validated);

        return back()->with('success', 'Drink added successfully.');
    }

    public function update(Request $request, Drink $drink)
    {
        $rules = [
            'name'             => 'required|string|max:255',
            'sell_by'          => 'required|in:bottle,tot',
            'crate_name'       => 'nullable|string|max:255',
            'bottles_per_crate'=> 'required|integer|min:1',
            'bottle_size'      => 'nullable|string|max:50',
            'is_active'        => 'boolean',
        ];

        // Add type-specific validation
        if ($request->input('sell_by') === 'tot') {
            $rules['tots_per_bottle'] = 'required|integer|min:1';
            $rules['price_per_tot']   = 'required|numeric|min:0';
        } else {
            $rules['price_per_bottle'] = 'required|numeric|min:0';
        }

        $validated = $request->validate($rules);
        $validated['crate_name'] = $validated['crate_name'] ?? $drink->crate_name;
        $validated['bottle_size'] = $validated['bottle_size'] ?? $drink->bottle_size;

        // Clear irrelevant fields based on sell_by type
        if ($validated['sell_by'] === 'tot') {
            $validated['price_per_bottle'] = 0;
        } else {
            $validated['tots_per_bottle'] = null;
            $validated['price_per_tot'] = null;
        }

        // Record price change if price changed (bottle price or tot price)
        $priceChanged = false;
        if ($validated['price_per_bottle'] != $drink->price_per_bottle) {
            $priceChanged = true;
            DrinkPriceHistory::create([
                'drink_id'       => $drink->id,
                'old_price'      => $drink->price_per_bottle,
                'new_price'      => $validated['price_per_bottle'],
                'effective_date' => Carbon::today(),
                'note'           => 'Bottle price change',
            ]);
        }

        if ($validated['sell_by'] === 'tot' && isset($validated['price_per_tot']) && $validated['price_per_tot'] != $drink->price_per_tot) {
            $priceChanged = true;
            DrinkPriceHistory::create([
                'drink_id'       => $drink->id,
                'old_price'      => $drink->price_per_tot ?? 0,
                'new_price'      => $validated['price_per_tot'],
                'effective_date' => Carbon::today(),
                'note'           => 'Tot price change',
            ]);
        }

        $drink->update($validated);

        return back()->with('success', 'Drink updated successfully.');
    }

    public function destroy(Drink $drink)
    {
        $drink->update(['is_active' => false]);
        return back()->with('success', 'Drink deactivated.');
    }
}
