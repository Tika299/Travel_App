<?php

namespace Database\Seeders;

use App\Models\TransportCompany; // Sử dụng model TransportCompany
use Illuminate\Database\Seeder; // Sử dụng class Seeder

class TransportCompaniesTableSeeder extends Seeder
{
    public function run()
    {
        TransportCompany::create([
            'transportation_id' => 2, // Khóa ngoại liên kết đến transportation_id
            'name' => 'Mai Linh Taxi', // Tên công ty
            'contact_info' => '028 3838 3838', // Thông tin liên hệ
            'address' => '45 Trường Sơn, Phường 2, Quận Tân Bình, TP.HCM', // Địa chỉ
            'latitude' => 10.797222, // Tọa độ vĩ độ
            'longitude' => 106.652500, // Tọa độ kinh độ
            'description' => 'Hãng taxi uy tín hàng đầu Việt Nam', // Mô tả
            'logo' => 'mai-linh.png', // Logo
            'operating_hours' => json_encode(['open' => '00:00', 'close' => '23:59']), // Giờ hoạt động (JSON)
            'rating' => 4.3, // Đánh giá trung bình
            'price_range' => json_encode(['base_km' => 12000, 'additional_km' => 14000, 'waiting_hour' => 3000]), // Bảng giá (JSON)
            'phone_number' => '028 3838 3838', // Số điện thoại
            'email' => 'info@mailinh.com', // Email
            'website' => 'www.mailinh.vn', // Website
            'payment_methods' => json_encode(['cash', 'bank_card']), // Phương thức thanh toán (JSON)
            'created_at' => now(), // Thời gian tạo
            'updated_at' => now(), // Thời gian cập nhật
        ]);

        TransportCompany::create([
            'transportation_id' => 2, // Khóa ngoại liên kết đến transportation_id
            'name' => 'Vinasun Taxi', // Tên công ty
            'contact_info' => '028 3827 2727', // Thông tin liên hệ
            'address' => '152 Lê Thánh Tôn, Bến Thành, Quận 1, TP.HCM', // Địa chỉ
            'latitude' => 10.772222, // Tọa độ vĩ độ
            'longitude' => 106.700833, // Tọa độ kinh độ
            'description' => 'Dịch vụ taxi chất lượng cao', // Mô tả
            'logo' => 'vinasun.png', // Logo
            'operating_hours' => json_encode(['open' => '00:00', 'close' => '23:59']), // Giờ hoạt động (JSON)
            'rating' => 4.2, // Đánh giá trung bình
            'price_range' => json_encode(['base_km' => 11000, 'additional_km' => 13000, 'waiting_hour' => 2800]), // Bảng giá (JSON)
            'phone_number' => '028 3827 2727', // Số điện thoại
            'email' => 'info@vinasun.com', // Email
            'website' => 'www.vinasun.vn', // Website
            'payment_methods' => json_encode(['cash', 'bank_card', 'mobile_app']), // Phương thức thanh toán (JSON)
            'created_at' => now(), // Thời gian tạo
            'updated_at' => now(), // Thời gian cập nhật
        ]);

        TransportCompany::create([
            'transportation_id' => 4, // Khóa ngoại liên kết đến transportation_id
            'name' => 'Grab Vietnam', // Tên công ty
            'contact_info' => '1900 2089', // Thông tin liên hệ
            'address' => 'Tòa nhà Viettel, 285 Cách Mạng Tháng 8, Quận 10, TP.HCM', // Địa chỉ
            'latitude' => 10.772778, // Tọa độ vĩ độ
            'longitude' => 106.669722, // Tọa độ kinh độ
            'description' => 'Ứng dụng đặt xe công nghệ', // Mô tả
            'logo' => 'grab.png', // Logo
            'operating_hours' => json_encode(['open' => '00:00', 'close' => '23:59']), // Giờ hoạt động (JSON)
            'rating' => 4.5, // Đánh giá trung bình
            'price_range' => json_encode(['base_km' => 8000, 'additional_km' => 10000, 'waiting_hour' => 2000]), // Bảng giá (JSON)
            'phone_number' => '1900 2089', // Số điện thoại
            'email' => 'support@grab.com', // Email
            'website' => 'www.grab.com/vn', // Website
            'payment_methods' => json_encode(['mobile_app', 'bank_card']), // Phương thức thanh toán (JSON)
            'created_at' => now(), // Thời gian tạo
            'updated_at' => now(), // Thời gian cập nhật
        ]);

        TransportCompany::create([
            'transportation_id' => 3, // Khóa ngoại liên kết đến transportation_id
            'name' => 'Xe buýt Sài Gòn', // Tên công ty
            'contact_info' => '028 3824 4444', // Thông tin liên hệ
            'address' => '319 Lý Thường Kiệt, Phường 15, Quận 11, TP.HCM', // Địa chỉ
            'latitude' => 10.763889, // Tọa độ vĩ độ
            'longitude' => 106.651389, // Tọa độ kinh độ
            'description' => 'Hệ thống xe buýt công cộng TP.HCM', // Mô tả
            'logo' => 'bus-saigon.png', // Logo
            'operating_hours' => json_encode(['open' => '05:00', 'close' => '21:00']), // Giờ hoạt động (JSON)
            'rating' => 3.8, // Đánh giá trung bình
            'price_range' => json_encode(['base_fare' => 5000, 'additional_km' => 2000]), // Bảng giá (JSON)
            'phone_number' => '028 3824 4444', // Số điện thoại
            'email' => 'info@bus-saigon.vn', // Email
            'website' => 'www.bus-saigon.vn', // Website
            'payment_methods' => json_encode(['cash', 'bus_card']), // Phương thức thanh toán (JSON)
            'created_at' => now(), // Thời gian tạo
            'updated_at' => now(), // Thời gian cập nhật
        ]);

        TransportCompany::create([
            'transportation_id' => 1, // Khóa ngoại liên kết đến transportation_id
            'name' => 'RentABike', // Tên công ty
            'contact_info' => '0909 123 456', // Thông tin liên hệ
            'address' => '22 Nguyễn Thị Minh Khai, Đa Kao, Quận 1, TP.HCM', // Địa chỉ
            'latitude' => 10.788889, // Tọa độ vĩ độ
            'longitude' => 106.700000, // Tọa độ kinh độ
            'description' => 'Dịch vụ cho thuê xe máy du lịch', // Mô tả
            'logo' => 'rentabike.png', // Logo
            'operating_hours' => json_encode(['open' => '07:00', 'close' => '20:00']), // Giờ hoạt động (JSON)
            'rating' => 4.0, // Đánh giá trung bình
            'price_range' => json_encode(['daily_rate' => 150000, 'hourly_rate' => 25000]), // Bảng giá (JSON)
            'phone_number' => '0909 123 456', // Số điện thoại
            'email' => 'info@rentabike.vn', // Email
            'website' => 'www.rentabike.vn', // Website
            'payment_methods' => json_encode(['cash', 'bank_card', 'mobile_app']), // Phương thức thanh toán (JSON)
            'created_at' => now(), // Thời gian tạo
            'updated_at' => now(), // Thời gian cập nhật
        ]);
    }
}