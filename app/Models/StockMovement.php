<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $fillable = [
        'product_id',
        'product_name',
        'movement_type',
        'quantity',
        'stock_before',
        'stock_after',
        'notes',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
