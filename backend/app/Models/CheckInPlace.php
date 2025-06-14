<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckInPlace extends Model
{
    use HasFactory;
      protected $table = 'checkin_places';

    protected $fillable = [
        'name', 'description', 'address', 'latitude', 'longitude',
        'image', 'rating', 'location_id'
    ];
    public function location()
    {
        return $this->belongsTo(Location::class);
    }
}
