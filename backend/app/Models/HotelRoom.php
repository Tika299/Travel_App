<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HotelRoom extends Model
{
    protected $fillable = [
        'hotel_id',
        'room_type',
        'price_per_night',
        'description',
        'amenities',
        'images'
    ];

    protected $casts = [
        'price_per_night' => 'float',
    ];

    /**
     * Quan hệ: phòng thuộc về 1 khách sạn
     */
    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }

    public function amenities()
    {
        return $this->belongsToMany(AmenityHotelRoom::class, 'amenity_hotel_room');
    }

    public function images()
    {
        return $this->hasMany(RoomImages::class, 'room_id');
    }
}
