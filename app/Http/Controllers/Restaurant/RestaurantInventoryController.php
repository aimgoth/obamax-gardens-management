<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\RestaurantInventory;
use App\Models\RestaurantDailyClosing;
use App\Models\TrackedItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RestaurantInventoryController extends Controller
{
    public function index()
    {
        $items = TrackedItem::active()->orderBy('item_type')->orderBy('name')->get();

        // Calculate current stock: received minus what was sold in closings
        $itemsWithStock = $items->map(function ($item) {
            $received  = RestaurantInventory::where('tracked_item_id', $item->id)->sum('quantity_received');
            $totalSold = RestaurantDailyClosing::where('tracked_item_id', $item->id)->sum('plates_sold');
            $item->total_received = $received;
            $item->total_sold     = (int) $totalSold;

            if ($item->item_type === 'Rice' && $item->kilos_per_bag > 0 && $item->plates_per_bag > 0) {
                // Convert plates sold back to kg to deduct from stock
                $kgUsed = $totalSold * ($item->kilos_per_bag / $item->plates_per_bag);
                $item->current_stock = max(0, $received - $kgUsed);
                $platesPerKg = $item->plates_per_bag / $item->kilos_per_bag;
                $item->expected_plates_in_stock = (int) round($item->current_stock * $platesPerKg);
                $item->size_breakdown = null;
            } else {
                // Fish/Meat/Chicken: pieces sold deducted directly
                $item->current_stock = max(0, $received - $totalSold);
                $item->expected_plates_in_stock = null;

                // Per-size breakdown: received vs sold vs remaining
                $breakdown = [];
                foreach (['Small', 'Medium', 'Large'] as $size) {
                    $rec  = RestaurantInventory::where('tracked_item_id', $item->id)->where('size', $size)->sum('quantity_received');
                    $sold = RestaurantDailyClosing::where('tracked_item_id', $item->id)->where('size_category', $size)->sum('plates_sold');
                    if ($rec > 0 || $sold > 0) {
                        $breakdown[] = [
                            'size'      => $size,
                            'received'  => (int) $rec,
                            'sold'      => (int) $sold,
                            'remaining' => max(0, (int) $rec - (int) $sold),
                        ];
                    }
                }
                $item->size_breakdown = $breakdown;
            }
            return $item;
        });

        $receipts = RestaurantInventory::with('trackedItem')
            ->orderByDesc('date_received')->orderByDesc('id')->take(100)->get();

        return Inertia::render('Restaurant/Inventory/Index', [
            'items'    => $itemsWithStock,
            'receipts' => $receipts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tracked_item_id'   => 'required|exists:tracked_items,id',
            'quantity_received' => 'required|numeric|min:0.01',
            'unit'              => 'required|string|max:50',
            'size'              => 'nullable|in:Small,Medium,Large',
            'cost'              => 'nullable|numeric|min:0',
            'date_received'     => 'required|date',
            'notes'             => 'nullable|string',
        ]);

        RestaurantInventory::create($validated);

        $item = TrackedItem::find($validated['tracked_item_id']);
        return back()->with('success', "{$validated['quantity_received']} {$validated['unit']} of {$item->name} received into inventory.");
    }

    public function destroy(RestaurantInventory $inventory)
    {
        $inventory->delete();
        return back()->with('success', 'Receipt entry removed.');
    }
}
