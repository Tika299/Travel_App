<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\HotelRoom;

class Hotel extends Model
{
    protected $fillable = [
        'name',
        'description',
        'address',
        'images',
        'latitude',
        'longitude',
        'rating',
        'review_count',
        'email',
        'phone',
        'wheelchair_access'
    ];

    protected $casts = [
        'rating' => 'float',
    ];

    public function reviews()
    {
        return $this->morphMany(\App\Models\Review::class, 'reviewable');
    }
    public function visitedByUsers()
    {
        return $this->morphMany(UserVisitedPlace::class, 'place');
    }

    // Mối quan hệ với Room
    public function rooms()
    {
        return $this->hasMany(HotelRoom::class);
    }
}
