<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CheckinPlace;
use App\Models\Hotel;
use App\Models\Restaurant;

class DaNangDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if data already exists
        if (CheckinPlace::where('address', 'like', '%Đà Nẵng%')->count() > 5 && 
            Hotel::where('address', 'like', '%Đà Nẵng%')->count() > 3 && 
            Restaurant::where('address', 'like', '%Đà Nẵng%')->count() > 5) {
            $this->command->info('Đà Nẵng data already exists. Skipping...');
            return;
        }

        $this->command->info('Adding data for Đà Nẵng...');

        // Thêm địa điểm tham quan Đà Nẵng
        $checkinPlaces = [
            [
                'name' => 'Bãi biển Mỹ Khê',
                'description' => 'Một trong những bãi biển đẹp nhất thế giới với cát trắng mịn và nước biển trong xanh.',
                'address' => 'Bãi biển Mỹ Khê, Quận Sơn Trà, Đà Nẵng',
                'region' => 'Trung',
                'price' => 0,
                'is_free' => true
            ],
            [
                'name' => 'Bán đảo Sơn Trà',
                'description' => 'Điểm ngắm toàn cảnh thành phố Đà Nẵng với tượng Phật Quan Âm cao 67m.',
                'address' => 'Bán đảo Sơn Trà, Quận Sơn Trà, Đà Nẵng',
                'region' => 'Trung',
                'price' => 0,
                'is_free' => true
            ],
            [
                'name' => 'Ngũ Hành Sơn',
                'description' => 'Núi đá cẩm thạch với 5 ngọn núi và nhiều hang động, chùa chiền cổ kính.',
                'address' => 'Ngũ Hành Sơn, Quận Ngũ Hành Sơn, Đà Nẵng',
                'region' => 'Trung',
                'price' => 40000,
                'is_free' => false
            ],
            [
                'name' => 'Bảo tàng Chăm',
                'description' => 'Bảo tàng trưng bày các hiện vật văn hóa Chăm Pa với kiến trúc độc đáo.',
                'address' => '2 Tháng 9, Quận Hải Châu, Đà Nẵng',
                'region' => 'Trung',
                'price' => 60000,
                'is_free' => false
            ],
            [
                'name' => 'Cầu Rồng',
                'description' => 'Cây cầu biểu tượng của Đà Nẵng với hình dáng rồng phun lửa vào buổi tối.',
                'address' => 'Cầu Rồng, Quận Sơn Trà, Đà Nẵng',
                'region' => 'Trung',
                'price' => 0,
                'is_free' => true
            ],
            [
                'name' => 'Cầu Vàng Bà Nà Hills',
                'description' => 'Cây cầu nổi tiếng với bàn tay đá khổng lồ tại Đà Nẵng.',
                'address' => 'Bà Nà Hills, Hòa Vang, Đà Nẵng',
                'region' => 'Trung',
                'price' => 700000,
                'is_free' => false
            ]
        ];

        foreach ($checkinPlaces as $place) {
            CheckinPlace::firstOrCreate(
                ['name' => $place['name']],
                $place
            );
        }

        // Thêm khách sạn Đà Nẵng
        $hotels = [
            [
                'name' => 'Khách sạn Furama Resort Đà Nẵng',
                'description' => 'Khách sạn 5 sao sang trọng với view biển đẹp và dịch vụ cao cấp.',
                'address' => '105 Võ Nguyên Giáp, Quận Sơn Trà, Đà Nẵng',
                'latitude' => 16.0474,
                'longitude' => 108.2062
            ],
            [
                'name' => 'Khách sạn InterContinental Đà Nẵng',
                'description' => 'Khách sạn quốc tế 5 sao với thiết kế hiện đại và tiện nghi sang trọng.',
                'address' => 'Bán đảo Sơn Trà, Quận Sơn Trà, Đà Nẵng',
                'latitude' => 16.1023,
                'longitude' => 108.2417
            ],
            [
                'name' => 'Khách sạn Pullman Đà Nẵng',
                'description' => 'Khách sạn 5 sao với view sông Hàn và thành phố tuyệt đẹp.',
                'address' => 'Trần Thị Lý, Quận Hải Châu, Đà Nẵng',
                'latitude' => 16.0544,
                'longitude' => 108.2022
            ],
            [
                'name' => 'Khách sạn Novotel Đà Nẵng',
                'description' => 'Khách sạn 4 sao quốc tế với vị trí thuận tiện gần trung tâm.',
                'address' => '36 Bạch Đằng, Quận Hải Châu, Đà Nẵng',
                'latitude' => 16.0619,
                'longitude' => 108.2125
            ],
            [
                'name' => 'Khách sạn Hyatt Regency Đà Nẵng',
                'description' => 'Khách sạn 5 sao với thiết kế độc đáo và dịch vụ spa cao cấp.',
                'address' => '5 Trường Sa, Quận Sơn Trà, Đà Nẵng',
                'latitude' => 16.0583,
                'longitude' => 108.2194
            ]
        ];

        foreach ($hotels as $hotel) {
            Hotel::firstOrCreate(
                ['name' => $hotel['name']],
                $hotel
            );
        }

        // Thêm nhà hàng Đà Nẵng
        $restaurants = [
            [
                'name' => 'Nhà hàng Hải Sản Biển Đông',
                'description' => 'Chuyên phục vụ hải sản tươi sống và đặc sản biển Đà Nẵng.',
                'address' => '23 Võ Nguyên Giáp, Quận Sơn Trà, Đà Nẵng',
                'latitude' => 16.0474,
                'longitude' => 108.2062,
                'rating' => 4.6,
                'price_range' => '300,000 - 800,000 VND'
            ],
            [
                'name' => 'Nhà hàng Madame Lân',
                'description' => 'Nhà hàng ẩm thực Việt Nam truyền thống với không gian đẹp.',
                'address' => '4 Bạch Đằng, Quận Hải Châu, Đà Nẵng',
                'latitude' => 16.0619,
                'longitude' => 108.2125,
                'rating' => 4.4,
                'price_range' => '200,000 - 500,000 VND'
            ],
            [
                'name' => 'Nhà hàng Quán Ăn Ngon Đà Nẵng',
                'description' => 'Hải sản tươi sống và đặc sản miền Trung',
                'address' => 'Lô 12-13 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
                'latitude' => 16.0474,
                'longitude' => 108.2062,
                'rating' => 4.3,
                'price_range' => '200,000 - 600,000 VND'
            ],
            [
                'name' => 'Nhà hàng Bún Chả Cá Đà Nẵng',
                'description' => 'Chuyên phục vụ món bún chả cá đặc trưng của Đà Nẵng.',
                'address' => '109 Nguyễn Chí Thanh, Quận Hải Châu, Đà Nẵng',
                'latitude' => 16.0544,
                'longitude' => 108.2022,
                'rating' => 4.2,
                'price_range' => '50,000 - 150,000 VND'
            ],
            [
                'name' => 'Nhà hàng Mì Quảng Đà Nẵng',
                'description' => 'Mì Quảng - món ăn đặc trưng của miền Trung với nước dùng đậm đà.',
                'address' => '45 Trần Phú, Quận Hải Châu, Đà Nẵng',
                'latitude' => 16.0619,
                'longitude' => 108.2125,
                'rating' => 4.1,
                'price_range' => '40,000 - 120,000 VND'
            ],
            [
                'name' => 'Nhà hàng Bánh Xèo Đà Nẵng',
                'description' => 'Bánh xèo giòn rụm với nhân tôm thịt và rau sống tươi ngon.',
                'address' => '67 Lê Duẩn, Quận Hải Châu, Đà Nẵng',
                'latitude' => 16.0544,
                'longitude' => 108.2022,
                'rating' => 4.0,
                'price_range' => '30,000 - 100,000 VND'
            ]
        ];

        foreach ($restaurants as $restaurant) {
            Restaurant::firstOrCreate(
                ['name' => $restaurant['name']],
                $restaurant
            );
        }

        $this->command->info('✅ Đã thêm dữ liệu cho Đà Nẵng:');
        $this->command->info('   - ' . count($checkinPlaces) . ' địa điểm tham quan');
        $this->command->info('   - ' . count($hotels) . ' khách sạn');
        $this->command->info('   - ' . count($restaurants) . ' nhà hàng');
    }
}
