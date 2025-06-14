<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'address',
        'latitude',
        'longitude',
        'rating',
        'price_range',
    ];

    /**
     * Relationship: A restaurant has many dishes
     */
    public function dishes()
    {
        return $this->hasMany(Dish::class);
    }
}
