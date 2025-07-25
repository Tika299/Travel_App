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
        'latitude',
        'longitude',
        'rating',
        'review_count',
        'contact_info',
        'wheelchair_access'
    ];

    protected $casts = [
        'rating' => 'float',
    ];

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
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
