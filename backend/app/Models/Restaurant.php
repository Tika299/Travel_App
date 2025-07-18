<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Restaurant extends Model
{
    protected $fillable = [
        'name',
        'description',
        'address',
        'latitude',
        'longitude',
        'rating',
        'price_range',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
    ];
    public function specialties()
{
    return $this->belongsToMany(Specialty::class);
}

}
