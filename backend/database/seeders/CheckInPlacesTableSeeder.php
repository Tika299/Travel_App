<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder; // Sử dụng class Seeder
use Illuminate\Support\Facades\DB; // Sử dụng DB facade

class CheckinPlacesTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('checkin_places')->insert([
            [
                'name' => 'Cầu Vàng Bà Nà Hills', // Tên địa điểm
                'description' => 'Cây cầu nổi tiếng với bàn tay đá khổng lồ tại Đà Nẵng.', // Mô tả
                'address' => 'Bà Nà Hills, Hòa Vang, Đà Nẵng', // Địa chỉ
                'latitude' => 16.0021, // Tọa độ vĩ độ
                'longitude' => 108.0655, // Tọa độ kinh độ
                'image' => 'images/checkin/golden_bridge.jpg', // Ảnh đại diện
                'rating' => 4.8, // Đánh giá trung bình
                'location_id' => 1, // Khóa ngoại liên kết đến bảng locations
                'price' => 700000.00, // Giá vé (700,000 VND)
                'operating_hours' => json_encode(['open' => '07:00', 'close' => '22:00']), // Thời gian hoạt động (JSON)
                'checkin_count' => 15234, // Số lượt check-in
                'review_count' => 8456, // Số đánh giá
                'images' => json_encode(['images/checkin/golden_bridge_1.jpg', 'images/checkin/golden_bridge_2.jpg']), // Danh sách ảnh (JSON)
                'region' => 'Trung', // Miền
                'caption' => 'Cầu Vàng nổi bật với kiến trúc độc đáo tại Đà Nẵng.', // Chú thích
                'distance' => 45, // Khoảng cách từ trung tâm (phút)
                'transport_options' => json_encode(['bus', 'taxi']), // Phương tiện di chuyển (JSON)
                'created_at' => now(), // Thời gian tạo
                'updated_at' => now(), // Thời gian cập nhật
            ],
            [
                'name' => 'Nhà Thờ Đức Bà Sài Gòn', // Tên địa điểm
                'description' => 'Biểu tượng kiến trúc cổ kính giữa lòng Sài Gòn.', // Mô tả
                'address' => '01 Công Xã Paris, Quận 1, TP.HCM', // Địa chỉ
                'latitude' => 10.7798, // Tọa độ vĩ độ
                'longitude' => 106.6992, // Tọa độ kinh độ
                'image' => 'images/checkin/notre_dame.jpg', // Ảnh đại diện
                'rating' => 4.7, // Đánh giá trung bình
                'location_id' => 2, // Khóa ngoại liên kết đến bảng locations
                'price' => 0.00, // Miễn phí
                'operating_hours' => json_encode(['open' => '06:00', 'close' => '18:00']), // Thời gian hoạt động (JSON)
                'checkin_count' => 5000, // Số lượt check-in
                'review_count' => 3000, // Số đánh giá
                'images' => json_encode(['images/checkin/notre_dame_1.jpg', 'images/checkin/notre_dame_2.jpg']), // Danh sách ảnh (JSON)
                'region' => 'Nam', // Miền
                'caption' => 'Kiến trúc cổ kính từ thời Pháp thuộc.', // Chú thích
                'distance' => 15, // Khoảng cách từ trung tâm (phút)
                'transport_options' => json_encode(['bus', 'walk']), // Phương tiện di chuyển (JSON)
                'created_at' => now(), // Thời gian tạo
                'updated_at' => now(), // Thời gian cập nhật
            ],
            [
                'name' => 'Vịnh Hạ Long', // Tên địa điểm
                'description' => 'Di sản thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi.', // Mô tả
                'address' => 'Hạ Long, Quảng Ninh', // Địa chỉ
                'latitude' => 20.9101, // Tọa độ vĩ độ
                'longitude' => 107.1839, // Tọa độ kinh độ
                'image' => 'images/checkin/halong_bay.jpg', // Ảnh đại diện
                'rating' => 5.0, // Đánh giá trung bình
                'location_id' => 3, // Khóa ngoại liên kết đến bảng locations
                'price' => 290000.00, // Giá vé (290,000 VND)
                'operating_hours' => json_encode(['open' => '07:00', 'close' => '17:00']), // Thời gian hoạt động (JSON)
                'checkin_count' => 10000, // Số lượt check-in
                'review_count' => 7000, // Số đánh giá
                'images' => json_encode(['images/checkin/halong_bay_1.jpg', 'images/checkin/halong_bay_2.jpg']), // Danh sách ảnh (JSON)
                'region' => 'Bắc', // Miền
                'caption' => 'Vẻ đẹp hùng vĩ của thiên nhiên Việt Nam.', // Chú thích
                'distance' => 120, // Khoảng cách từ trung tâm (phút)
                'transport_options' => json_encode(['bus', 'boat']), // Phương tiện di chuyển (JSON)
                'created_at' => now(), // Thời gian tạo
                'updated_at' => now(), // Thời gian cập nhật
            ]
        ]);
    }
}