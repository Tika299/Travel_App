<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dish extends Model
{
    protected $fillable = [
        'restaurant_id',
        'name',
        'price',
        'description',
        'is_best_seller',
        'category',
    ];

    protected $casts = [
        'price' => 'float',
        'is_best_seller' => 'boolean',
    ];

    /**
     * Mối quan hệ: món ăn thuộc về nhà hàng
     */
    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
}
