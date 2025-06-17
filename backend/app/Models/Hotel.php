<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hotel extends Model
{
    protected $fillable = [
        'name',
        'description',
        'address',
        'latitude',
        'longitude',
        'rating',
        'contact_info',
        'wheelchair_access',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
        'wheelchair_access' => 'boolean',
    ];

   public function reviews()
{
    return $this->morphMany(Review::class, 'reviewable');
}
public function visitedByUsers()
{
    return $this->morphMany(UserVisitedPlace::class, 'place');
}

}
