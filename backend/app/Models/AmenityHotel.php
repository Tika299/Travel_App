<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AmenityHotel extends Model
{
    protected $fillable = [
        'hotel_id',
        'amenity_id',
    ];

    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }

    public function amenity()
    {
        return $this->belongsTo(Amenity::class);
    }
}
