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
        'image'
    ];
    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'rating' => 'decimal:1',
        'has_fee' => 'boolean'
    ];
    public function reviews()
    {
        return $this->hasMany(Review::class, 'reviewable_id')
                    ->where('reviewable_type', self::class);
    }
    
    public function category()
    {
        return $this->belongsTo(Category::class, 'category', 'name');
    }

    // Nếu bạn có quan hệ với CheckinPlace
    public function checkinPlaces()
    {
        return $this->hasMany(CheckinPlace::class);
    }
     public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : '/placeholder.svg?height=200&width=300';
    }
}
