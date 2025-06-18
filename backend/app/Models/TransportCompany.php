<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransportCompany extends Model
{
    use HasFactory;

    protected $fillable = [
        'transportation_id',
        'name',
        'contact_info',
        'address',
        'latitude',
        'longitude',
        'description',
        'logo',
        'operating_hours',
        'rating',
    ];

    protected $casts = [
        'operating_hours' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
    ];

    // Quan hệ với bảng transportation (nếu bạn có bảng này)
    public function transportation()
    {
        return $this->belongsTo(Transportation::class);
    }
    
    // Quan hệ với bảng reviews (đa hình)
        public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
    }
}
