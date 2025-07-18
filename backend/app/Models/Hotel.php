<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\HotelRoom;

class Hotel extends Model
{
    protected $fillable = [
        'name',
        'description',
        'rating',
        'phone_number',
        'main_image_url'
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
