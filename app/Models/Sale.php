<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'product_id',
        'product_name',
        'quantity',
        'unit_price',
        'total_amount',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
