<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AmenityHotel extends Model
{
    protected $table = 'amenity_hotel'; // Rất quan trọng!
    
    protected $fillable = [
        'hotel_id',
        'amenity_id',
    ];
}
