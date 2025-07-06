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
        // 'slug', // Nếu bạn quyết định thêm cột slug vào bảng locations
    ];

    /**
     * Các thuộc tính nên được cast sang kiểu dữ liệu cụ thể.
     * Ví dụ: latitude và longitude có thể muốn cast sang float.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    /**
     * Định nghĩa mối quan hệ: Một Location (thành phố) có nhiều CheckinPlace.
     * Model CheckinPlace sẽ có khóa ngoại 'location_id' trỏ về bảng này.
     *
     * @return HasMany
     */
    public function checkinPlaces(): HasMany
    {
        return $this->hasMany(CheckinPlace::class);
    }

   
}