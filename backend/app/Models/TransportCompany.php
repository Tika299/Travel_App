<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // Sử dụng factory cho Eloquent
use Illuminate\Database\Eloquent\Model; // Sử dụng model cơ bản của Eloquent

class TransportCompany extends Model
{
    use HasFactory; // Sử dụng trait HasFactory

    protected $table = 'transport_companies'; // Tên bảng trong cơ sở dữ liệu

    protected $fillable = [
        'transportation_id', // Khóa ngoại liên kết đến transportation_id
        'name', // Tên công ty
        'contact_info', // Thông tin liên hệ
        'address', // Địa chỉ
        'latitude', // Tọa độ vĩ độ
        'longitude', // Tọa độ kinh độ
        'description', // Mô tả
        'logo', // Logo
        'operating_hours', // Giờ hoạt động (JSON)
        'rating', // Đánh giá trung bình
        'price_range', // Bảng giá (JSON)
        'phone_number', // Số điện thoại
        'email', // Email
        'website', // Website
        'payment_methods', // Phương thức thanh toán (JSON)
    ]; // Các trường có thể gán giá trị hàng loạt

    protected $casts = [
        'operating_hours' => 'json', // Ép kiểu operating_hours thành JSON
        'price_range' => 'json', // Ép kiểu price_range thành JSON
        'payment_methods' => 'json', // Ép kiểu payment_methods thành JSON
        'latitude' => 'float', // Ép kiểu latitude thành float
        'longitude' => 'float', // Ép kiểu longitude thành float
        'rating' => 'float', // Ép kiểu rating thành float
    ]; // Ép kiểu dữ liệu

    // Quan hệ với bảng transportation
    public function transportation()
    {
        return $this->belongsTo(Transportation::class); // Mối quan hệ 1-1 với Transportation
    }

    // Quan hệ với bảng reviews (đa hình)
    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable'); // Mối quan hệ morph với Review
    }
}