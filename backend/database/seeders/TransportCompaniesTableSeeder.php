<?php

namespace Database\Seeders;

use App\Models\TransportCompany;
use Illuminate\Database\Seeder;

class TransportCompaniesTableSeeder extends Seeder
{
    public function run()
    {
        TransportCompany::create([
            'transportation_id' => 2,
            'name' => 'Mai Linh Taxi',
            'short_description' => 'Hãng taxi lâu đời và uy tín',
            'description' => 'Hãng taxi uy tín hàng đầu Việt Nam',
            'address' => '45 Trường Sơn, Phường 2, Quận Tân Bình, TP.HCM',
            'latitude' => 10.797222,
            'longitude' => 106.652500,
            'logo' => 'mai-linh.png',
            'operating_hours' => json_encode(['open' => '00:00', 'close' => '23:59']),
            'rating' => 4.3,
            'price_range' => json_encode(['base_km' => 12000, 'additional_km' => 14000, 'waiting_hour' => 3000]),
            'phone_number' => '028 3838 3838',
            'email' => 'info@mailinh.com',
            'website' => 'www.mailinh.vn',
            'payment_methods' => json_encode(['cash', 'bank_card']),
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        TransportCompany::create([
            'transportation_id' => 2,
            'name' => 'Vinasun Taxi',
            'short_description' => 'Dịch vụ taxi chất lượng cao tại TP.HCM',
            'description' => 'Dịch vụ taxi chất lượng cao',
            'address' => '152 Lê Thánh Tôn, Bến Thành, Quận 1, TP.HCM',
            'latitude' => 10.772222,
            'longitude' => 106.700833,
            'logo' => 'vinasun.png',
            'operating_hours' => json_encode(['open' => '00:00', 'close' => '23:59']),
            'rating' => 4.2,
            'price_range' => json_encode(['base_km' => 11000, 'additional_km' => 13000, 'waiting_hour' => 2800]),
            'phone_number' => '028 3827 2727',
            'email' => 'info@vinasun.com',
            'website' => 'www.vinasun.vn',
            'payment_methods' => json_encode(['cash', 'bank_card', 'mobile_app']),
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        TransportCompany::create([
            'transportation_id' => 4,
            'name' => 'Grab Vietnam',
            'short_description' => 'Ứng dụng gọi xe hàng đầu Đông Nam Á',
            'description' => 'Ứng dụng đặt xe công nghệ',
            'address' => 'Tòa nhà Viettel, 285 Cách Mạng Tháng 8, Quận 10, TP.HCM',
            'latitude' => 10.772778,
            'longitude' => 106.669722,
            'logo' => 'grab.png',
            'operating_hours' => json_encode(['open' => '00:00', 'close' => '23:59']),
            'rating' => 4.5,
            'price_range' => json_encode(['base_km' => 8000, 'additional_km' => 10000, 'waiting_hour' => 2000]),
            'phone_number' => '1900 2089',
            'email' => 'support@grab.com',
            'website' => 'www.grab.com/vn',
            'payment_methods' => json_encode(['mobile_app', 'bank_card']),
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        TransportCompany::create([
            'transportation_id' => 3,
            'name' => 'Xe buýt Sài Gòn',
            'short_description' => 'Hệ thống xe buýt công cộng TP.HCM',
            'description' => 'Hệ thống xe buýt công cộng TP.HCM',
            'address' => '319 Lý Thường Kiệt, Phường 15, Quận 11, TP.HCM',
            'latitude' => 10.763889,
            'longitude' => 106.651389,
            'logo' => 'bus-saigon.png',
            'operating_hours' => json_encode(['open' => '05:00', 'close' => '21:00']),
            'rating' => 3.8,
            'price_range' => json_encode(['base_fare' => 5000, 'additional_km' => 2000]),
            'phone_number' => '028 3824 4444',
            'email' => 'info@bus-saigon.vn',
            'website' => 'www.bus-saigon.vn',
            'payment_methods' => json_encode(['cash', 'bus_card']),
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        TransportCompany::create([
            'transportation_id' => 1,
            'name' => 'RentABike',
            'short_description' => 'Cho thuê xe máy chất lượng cao',
            'description' => 'Dịch vụ cho thuê xe máy du lịch',
            'address' => '22 Nguyễn Thị Minh Khai, Đa Kao, Quận 1, TP.HCM',
            'latitude' => 10.788889,
            'longitude' => 106.700000,
            'logo' => 'rentabike.png',
            'operating_hours' => json_encode(['open' => '07:00', 'close' => '20:00']),
            'rating' => 4.0,
            'price_range' => json_encode(['daily_rate' => 150000, 'hourly_rate' => 25000]),
            'phone_number' => '0909 123 456',
            'email' => 'info@rentabike.vn',
            'website' => 'www.rentabike.vn',
            'payment_methods' => json_encode(['cash', 'bank_card', 'mobile_app']),
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
