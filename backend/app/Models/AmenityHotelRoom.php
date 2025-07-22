<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AmenityHotelRoom extends Model
{

    protected $fillable = [
        'hotel_room_id',
        'amenity_id',
    ];

    public function hotelRoom()
    {
        return $this->belongsTo(HotelRoom::class);
    }

    public function amenity()
    {
        return $this->belongsTo(Amenity::class);
    }
}
