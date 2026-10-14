<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
public function index()
{
    $products = Product::latest()->get();

    return response()->json([
        'products' => $products,
    ], 200);
}
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'category' =>  [
    'required',
    Rule::in([
        'Canned Goods',
        'Rice',
        'Cooking Ingredients/Essential',
        'Frozen Foods',
        'Sweets',
        'Junk Foods',
        'Beverages',
        'Coffee/Dairy/Energy Drinks',
    ]),
],
        'price' => 'required|numeric|min:0|max:99999999.99',
        'stock_quantity' => 'sometimes|required|integer|min:0',
    ]);

    $product = Product::create($validated);

    return response()->json([
        'message' => 'Product created successfully!',
        'product' => $product,
    ], 201);
}


public function update(Request $request, Product $product)
{
    $validated = $request->validate([
        'name' => 'sometimes|required|string|max:255',
        'description' => 'sometimes|nullable|string',
        'category' => 'sometimes|nullable|string|max:100',
        'price' => 'sometimes|required|numeric|min:0|max:99999999.99',
        'stock_quantity' => 'sometimes|required|integer|min:0',
    ]);

    $product->update($validated);

    return response()->json([
        'message' => 'Product updated successfully!',
        'product' => $product->fresh(),
    ], 200);
}

public function destroy(Product $product)
{
    $product->delete();

    return response()->json([
        'message' => 'Product deleted successfully!',
    ], 200);
}


}