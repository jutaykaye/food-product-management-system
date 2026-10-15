<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\StockMovement;
use App\Models\ActivityLog;

class SaleController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $sale = DB::transaction(function () use ($validated, $request) {
            $product = Product::whereKey($validated['product_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($product->stock_quantity < $validated['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => [
                        'Not enough stock available. Current stock: '
                        . $product->stock_quantity,
                    ],
                ]);
            }

            $unitPrice = (float) $product->price;
            $quantity = (int) $validated['quantity'];

            $sale = Sale::create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total_amount' => $unitPrice * $quantity,
            ]);

            
$before = $product->stock_quantity;

$product->decrement('stock_quantity', $quantity);
$product->refresh();

StockMovement::create([
    'product_id' => $product->id,
    'product_name' => $product->name,
    'movement_type' => 'sale',
    'quantity' => $quantity,
    'stock_before' => $before,
    'stock_after' => $product->stock_quantity,
    'notes' => 'Stock deducted from sale #' . $sale->id,
]);
ActivityLog::create([
    'user_id' => $request->user()?->id,
    'action' => 'sale_recorded',
    'entity_type' => 'sale',
    'entity_id' => $sale->id,
    'entity_name' => $sale->product_name,
    'details' => "Sold {$quantity} units for ₱" .
        number_format((float) $sale->total_amount, 2) .
        ". Stock: {$before} → {$product->stock_quantity}.",
    'old_values' => [
        'stock_quantity' => $before,
    ],
    'new_values' => [
        'stock_quantity' => $product->stock_quantity,
        'quantity_sold' => $quantity,
        'unit_price' => $sale->unit_price,
        'total_amount' => $sale->total_amount,
    ],
]);
return $sale;

        });

        return response()->json([
            'message' => 'Sale recorded successfully!',
            'sale' => $sale,
            'remaining_stock' => Product::find($sale->product_id)
                ?->stock_quantity,
        ], 201);
    }

    public function index()
    {
        $sales = Sale::latest()->get();

        return response()->json([
            'sales' => $sales,
        ], 200);
    }
}
