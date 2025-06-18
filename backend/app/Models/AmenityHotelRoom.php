<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AmenityHotelRoom extends Model
{
    protected $table = 'amenity_hotel_room'; // Đây là bảng bạn đã tạo trong migration

    protected $fillable = [
        'hotel_room_id',
        'amenity_id',
    ];
}
