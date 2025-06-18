<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // Sử dụng factory cho Eloquent
use Illuminate\Database\Eloquent\Model; // Sử dụng model cơ bản của Eloquent

class CheckinPlace extends Model
{
    use HasFactory; // Sử dụng trait HasFactory

    protected $table = 'checkin_places'; // Tên bảng trong cơ sở dữ liệu

    protected $fillable = [
        'name', // Tên địa điểm
        'description', // Mô tả
        'address', // Địa chỉ
        'latitude', // Tọa độ vĩ độ
        'longitude', // Tọa độ kinh độ
        'image', // Ảnh đại diện
        'rating', // Đánh giá trung bình
        'location_id', // Khóa ngoại liên kết đến bảng locations
        'price', // Giá vé
        'operating_hours', // Thời gian hoạt động (JSON)
        'checkin_count', // Số lượt check-in
        'review_count', // Số đánh giá
        'images', // Danh sách ảnh (JSON)
        'region', // Miền (Bắc, Trung, Nam)
        'caption', // Chú thích
        'distance', // Khoảng cách
        'transport_options', // Phương tiện di chuyển (JSON)
    ]; // Các trường có thể gán giá trị hàng loạt

    protected $casts = [
        'latitude' => 'float', // Ép kiểu latitude thành float
        'longitude' => 'float', // Ép kiểu longitude thành float
        'rating' => 'float', // Ép kiểu rating thành float
        'operating_hours' => 'json', // Ép kiểu operating_hours thành JSON
        'images' => 'json', // Ép kiểu images thành JSON
        'transport_options' => 'json', // Ép kiểu transport_options thành JSON
    ]; // Ép kiểu dữ liệu

    /**
     * Mối quan hệ với Location
     */
    public function location()
    {
        return $this->belongsTo(Location::class); // Mối quan hệ 1-1 với Location
    }

    /**
     * Mối quan hệ morph: các hình ảnh liên kết
     */
    public function images()
    {
        return $this->morphMany(Image::class, 'imageable'); // Mối quan hệ morph với Image
    }

    /**
     * Mối quan hệ morph: người dùng đã từng đến đây
     */
    public function visitedUsers()
    {
        return $this->morphToMany(User::class, 'place', 'user_visited_places'); // Mối quan hệ morph với User
    }

    /**
     * Mối quan hệ morph: đánh giá địa điểm
     */
    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable'); // Mối quan hệ morph với Review
    }

    /**
     * Mối quan hệ: các món ăn tại địa điểm này
     */
    public function foods()
    {
        return $this->hasMany(Food::class); // Mối quan hệ 1-nhiều với Food
    }

    /**
     * Mối quan hệ: các khách sạn gần địa điểm này
     */
    public function hotels()
    {
        return $this->hasMany(Hotel::class); // Mối quan hệ 1-nhiều với Hotel
    }

    /**
     * Mối quan hệ: các hãng xe phục vụ tại khu vực địa điểm này
     */
    public function transportCompanies()
    {
        return $this->hasMany(TransportCompany::class, 'location_id', 'location_id'); // Mối quan hệ 1-nhiều với TransportCompany
    }
}