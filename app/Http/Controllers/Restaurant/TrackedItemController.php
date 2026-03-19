<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\TrackedItem;
use App\Models\TrackedItemPriceHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class TrackedItemController extends Controller
{
    public function index()
    {
        return Inertia::render('Restaurant/TrackedItems/Index', [
            'items' => TrackedItem::orderBy('item_type')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'item_type'          => 'required|in:Rice,Fish,Meat,Stew,Chicken,Other',
            'kilos_per_bag'      => 'nullable|numeric|min:0',
            'plates_per_bag'     => 'nullable|integer|min:0',
            'price_per_plate'    => 'nullable|numeric|min:0',
            'price_small'        => 'nullable|numeric|min:0',
            'price_medium'       => 'nullable|numeric|min:0',
            'price_large'        => 'nullable|numeric|min:0',
            'unit_of_measurement'=> 'nullable|string|max:50',
            'price_per_unit'     => 'nullable|numeric|min:0',
        ]);
        TrackedItem::create($validated);
        return back()->with('success', 'Item added successfully.');
    }

    public function update(Request $request, TrackedItem $item)
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'item_type'          => 'required|in:Rice,Fish,Meat,Stew,Chicken,Other',
            'kilos_per_bag'      => 'nullable|numeric|min:0',
            'plates_per_bag'     => 'nullable|integer|min:0',
            'price_per_plate'    => 'nullable|numeric|min:0',
            'price_small'        => 'nullable|numeric|min:0',
            'price_medium'       => 'nullable|numeric|min:0',
            'price_large'        => 'nullable|numeric|min:0',
            'unit_of_measurement'=> 'nullable|string|max:50',
            'price_per_unit'     => 'nullable|numeric|min:0',
            'is_active'          => 'boolean',
        ]);

        // Record price history for any price that changed
        $priceFields = [
            'price_per_plate' => 'per_plate',
            'price_small'     => 'small',
            'price_medium'    => 'medium',
            'price_large'     => 'large',
        ];
        foreach ($priceFields as $field => $type) {
            if (isset($validated[$field]) && $validated[$field] != $item->{$field}) {
                TrackedItemPriceHistory::create([
                    'tracked_item_id' => $item->id,
                    'old_price'       => $item->{$field},
                    'new_price'       => $validated[$field],
                    'price_type'      => $type,
                    'effective_date'  => Carbon::today(),
                ]);
            }
        }

        $item->update($validated);
        return back()->with('success', 'Item updated successfully.');
    }

    public function destroy(TrackedItem $item)
    {
        $item->update(['is_active' => false]);
        return back()->with('success', 'Item deactivated.');
    }
}
