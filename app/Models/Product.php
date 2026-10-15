<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'category',
        'price',
        'stock_quantity',
    ];

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
}
