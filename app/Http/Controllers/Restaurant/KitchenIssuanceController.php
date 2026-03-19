<?php

namespace App\Http\Controllers\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\KitchenIssuance;
use App\Models\RestaurantInventory;
use App\Models\TrackedItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KitchenIssuanceController extends Controller
{
    public function index()
    {
        $items = TrackedItem::active()->orderBy('name')->get();
        $issuances = KitchenIssuance::with('trackedItem')
            ->orderByDesc('issued_date')->orderByDesc('id')->take(100)->get();

        return Inertia::render('Restaurant/KitchenIssuance/Index', [
            'items'     => $items,
            'issuances' => $issuances,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tracked_item_id' => 'required|exists:tracked_items,id',
            'quantity_issued' => 'required|numeric|min:0.01',
            'unit'            => 'required|string|max:50',
            'size'            => 'nullable|in:Small,Medium,Large',
            'issued_date'     => 'required|date',
            'notes'           => 'nullable|string',
        ]);

        $item = TrackedItem::find($validated['tracked_item_id']);

        // Check available inventory stock
        $totalReceived = RestaurantInventory::where('tracked_item_id', $item->id)->sum('quantity_received');
        $totalIssued   = KitchenIssuance::where('tracked_item_id', $item->id)->sum('quantity_issued');
        $available     = $totalReceived - $totalIssued;

        if ($validated['quantity_issued'] > $available) {
            return back()->withErrors(['quantity_issued' => "Insufficient stock. Available: {$available} {$validated['unit']}."]);
        }

        // Auto-calculate expected plates for Rice items
        if ($item->item_type === 'Rice' && $item->kilos_per_bag > 0 && $item->plates_per_bag > 0) {
            $platesPerKg = $item->plates_per_bag / $item->kilos_per_bag;
            $validated['expected_plates'] = (int) round($platesPerKg * $validated['quantity_issued']);
        }

        KitchenIssuance::create($validated);
        return back()->with('success', 'Kitchen issuance recorded.');
    }

    public function destroy(KitchenIssuance $issuance)
    {
        $issuance->delete();
        return back()->with('success', 'Issuance removed.');
    }
}
