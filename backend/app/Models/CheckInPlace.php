<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany; // Dòng này là quan trọng

class CheckinPlace extends Model
{
    use HasFactory; // Đảm bảo đã có HasFactory

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
        'price',
        'is_free',
        'operating_hours',
        'checkin_count',
        'review_count',
        'images',
        'region',
        'caption',
     
        'transport_options',
        'status', // ✅ Đã thêm vào fillable
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
        'is_free' => 'boolean',
        'operating_hours' => 'array', // Thay vì 'json', dùng 'array' nếu bạn muốn nó tự động convert JSON sang mảng/object PHP
        'images' => 'array', // Tương tự, dùng 'array'
        'transport_options' => 'array', // Tương tự, dùng 'array'
    ];

    /**
     * Mối quan hệ với Location
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Mối quan hệ polymorphic: các đánh giá cho địa điểm này.
     * Cần duy trì phương thức này và đảm bảo nó được sử dụng trong các controller.
     */
    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    /**
     * Mối quan hệ polymorphic: các hình ảnh liên kết (nếu có riêng Image model cho các loại ảnh khác nhau)
     * Lưu ý: Bạn cũng có một trường 'images' trong fillable được cast là 'array'.
     * Nếu 'images' trong fillable là đường dẫn của ảnh, và bạn cũng có một model 'Image' riêng biệt
     * để lưu trữ nhiều ảnh liên quan đến CheckinPlace, thì cả hai đều có thể tồn tại.
     * Hãy đảm bảo bạn hiểu rõ mục đích của từng 'images'.
     */
    public function images(): MorphMany // Thêm type hint cho rõ ràng
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
     * Mối quan hệ: các món ăn tại địa điểm này
     */
    public function dishes()
    {
        return $this->hasMany(Dish::class);
    }

    /**
     * Mối quan hệ: các hãng xe phục vụ tại khu vực địa điểm này
     */
    public function transportCompanies()
    {
        return $this->hasMany(TransportCompany::class, 'location_id', 'location_id');
    }

    /**
     * Mối quan hệ với các khách sạn được liên kết
     */
    public function linkedHotels()
    {
        return $this->hasMany(CheckinPlaceHotel::class);
    }

    /**
     * Mối quan hệ với các ảnh check-in do người dùng tải lên
     */
    public function checkinPhotos()
    {
        return $this->hasMany(CheckinPhoto::class, 'checkin_place_id');
    }
}