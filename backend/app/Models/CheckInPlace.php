<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckinPlace extends Model
{
    use HasFactory;

    protected $table = 'checkin_places';

    protected $fillable = [
        'name',
        'description',
        'address',
        'latitude',
        'longitude',
        'image',
        'rating',
        'location_id',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
    ];

    /**
     * Mối quan hệ với Location
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Mối quan hệ morph: các hình ảnh liên kết
     */
    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    /**
     * Mối quan hệ morph: người dùng đã từng đến đây
     */
    public function visitedUsers()
    {
        return $this->morphToMany(User::class, 'place', 'user_visited_places');
    }

    /**
     * Mối quan hệ morph: đánh giá địa điểm
     */
    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
    }
    /**
 * Mối quan hệ: các món ăn tại địa điểm này
 */
public function foods()
{
    return $this->hasMany(Food::class);
}

/**
 * Mối quan hệ: các khách sạn gần địa điểm này
 */
public function hotels()
{
    return $this->hasMany(Hotel::class);
}

/**
 * Mối quan hệ: các hãng xe phục vụ tại khu vực địa điểm này
 */
public function transportCompanies()
{
    return $this->hasMany(TransportCompany::class, 'location_id', 'location_id');
}

}
