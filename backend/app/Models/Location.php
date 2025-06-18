<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'address',
        'latitude',
        'longitude',
        'checkin_count',
        'rating',
        'has_fee',
        'category',
    ];

    // Nếu bạn có quan hệ với CheckinPlace
    public function checkinPlaces()
    {
        return $this->hasMany(CheckinPlace::class);
    }
}
