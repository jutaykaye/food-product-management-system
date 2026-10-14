<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

abstract class Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0|max:99999999.99',
            'stock_quantity' => 'sometimes|required|integer|min:0',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully!',
            'product' => $product,
        ], 201);
    }
}
