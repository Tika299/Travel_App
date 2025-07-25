<?php
namespace Database\Seeders;

use App\Models\HotelRoom;
use Illuminate\Database\Seeder;

class HotelRoomsTableSeeder extends Seeder
{
    public function run()
    {
        HotelRoom::create([
            'hotel_id' => 1,
            'room_type' => 'Phòng Deluxe hướng biển',
            'price_per_night' => 4500000,
            'description' => 'Phòng rộng với view biển, giường king size',
            'amenities' => json_encode(['điều hòa', 'minibar', 'két an toàn', 'TV', 'wifi', 'bồn tắm']),
            'images' => json_encode(['/public/img/Vinpearl_Luxury_da_nang.jpg', 'phong2.jpg'])
        ]);

        HotelRoom::create([
            'hotel_id' => 2,
            'room_type' => 'Phòng Superior',
            'price_per_night' => 3200000,
            'description' => 'Phòng tiêu chuẩn với giường queen',
            'amenities' => json_encode(['điều hòa', 'TV', 'wifi']),
            'images' => json_encode(['/public/img/InterContinental_Saigon.jpg'])
        ]);

        HotelRoom::create([
            'hotel_id' => 3,
            'room_type' => 'Suite Executive',
            'price_per_night' => 8500000,
            'description' => 'Suite cao cấp với phòng khách riêng',
            'amenities' => json_encode(['điều hòa', 'minibar', 'phòng làm việc', 'TV màn hình phẳng', 'wifi tốc độ cao']),
            'images' => json_encode(['/public/img/Muong_Thanh_Sapa.jpg', '/public/img/phong5.jpg'])
        ]);

        HotelRoom::create([
            'hotel_id' => 4,
            'room_type' => 'Phòng Family',
            'price_per_night' => 3800000,
            'description' => 'Phòng gia đình với 2 giường đơn',
            'amenities' => json_encode(['điều hòa', 'TV', 'wifi', 'ban công']),
            'images' => json_encode(['/public/img/Fusion_Suite_Phu_Quoc.jpg'])
        ]);

        HotelRoom::create([
            'hotel_id' => 5,
            'room_type' => 'Villa hồ bơi riêng',
            'price_per_night' => 12500000,
            'description' => 'Villa sang trọng với hồ bơi riêng',
            'amenities' => json_encode(['điều hòa', 'bếp mini', 'hồ bơi riêng', 'TV', 'wifi']),
            'images' => json_encode(['/public/img/Azerai_La_Residence_Hue.jpg', '/public/img/phong8.jpg'])
        ]);
    }
}