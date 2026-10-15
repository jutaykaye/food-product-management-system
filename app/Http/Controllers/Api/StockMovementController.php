<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\ActivityLog;

class StockMovementController extends Controller
{
    public function addStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

       $movement = DB::transaction(function () use ($product, $validated, $request) {
            $product = Product::whereKey($product->id)
                ->lockForUpdate()
                ->firstOrFail();

            $before = $product->stock_quantity;
            $quantity = $validated['quantity'];

            $product->increment('stock_quantity', $quantity);
            $product->refresh();

            $movement = StockMovement::create([
              'product_id' => $product->id,
              'product_name' => $product->name,
              'movement_type' => 'stock_in',
              'quantity' => $quantity,
              'stock_before' => $before,
              'stock_after' => $product->stock_quantity,
              'notes' => $validated['notes'] ?? 'Stock added',
            ]);
            ActivityLog::create([
                'user_id' => $request->user()?->id,
                'action' => 'stock_added',
                'entity_type' => 'product',
                'entity_id' => $product->id,
                'entity_name' => $product->name,
                'details' => "Added {$quantity} units. Stock: {$before} → {$product->stock_quantity}.",
                'old_values' => [
                'stock_quantity' => $before,
            ],
            'new_values' => [
                'stock_quantity' => $product->stock_quantity,
                'quantity_added' => $quantity,
                'notes' => $validated['notes'] ?? 'Stock added',
            ],
]);

return $movement;
        });

        return response()->json([
            'message' => 'Stock added successfully!',
            'movement' => $movement,
            'product' => $product->fresh(),
        ], 201);
    }

    public function index()
    {
        return response()->json([
            'movements' => StockMovement::latest()->get(),
        ]);
    }
}
