<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CheckinPlacesTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('checkin_places')->insert([
            [
                'name' => 'Cầu Vàng Bà Nà Hills',
                'description' => 'Cây cầu nổi tiếng với bàn tay đá khổng lồ tại Đà Nẵng.',
                'address' => 'Bà Nà Hills, Hòa Vang, Đà Nẵng',
                'latitude' => 16.0021,
                'longitude' => 108.0655,
                'image' => 'images/checkin/golden_bridge.jpg',
                'rating' => 4.8,
                'location_id' => 1,
                'price' => 700000.00,
                'is_free' => false,
                'operating_hours' => json_encode(['open' => '07:00', 'close' => '22:00']),
                'checkin_count' => 15234,
                'review_count' => 8456,
                'images' => json_encode([
                    'images/checkin/golden_bridge_1.jpg',
                    'images/checkin/golden_bridge_2.jpg'
                ]),
                'region' => 'Trung',
                'caption' => 'Cầu Vàng nổi bật với kiến trúc độc đáo tại Đà Nẵng.',
                'distance' => 45,
                'transport_options' => json_encode(['bus', 'taxi']),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Nhà Thờ Đức Bà Sài Gòn',
                'description' => 'Biểu tượng kiến trúc cổ kính giữa lòng Sài Gòn.',
                'address' => '01 Công Xã Paris, Quận 1, TP.HCM',
                'latitude' => 10.7798,
                'longitude' => 106.6992,
                'image' => 'images/checkin/notre_dame.jpg',
                'rating' => 4.7,
                'location_id' => 2,
                'price' => 0.00,
                'is_free' => true,
                'operating_hours' => json_encode(['open' => '06:00', 'close' => '18:00']),
                'checkin_count' => 5000,
                'review_count' => 3000,
                'images' => json_encode([
                    'images/checkin/notre_dame_1.jpg',
                    'images/checkin/notre_dame_2.jpg'
                ]),
                'region' => 'Nam',
                'caption' => 'Kiến trúc cổ kính từ thời Pháp thuộc.',
                'distance' => 15,
                'transport_options' => json_encode(['bus', 'walk']),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Vịnh Hạ Long',
                'description' => 'Di sản thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi.',
                'address' => 'Hạ Long, Quảng Ninh',
                'latitude' => 20.9101,
                'longitude' => 107.1839,
                'image' => 'images/checkin/halong_bay.jpg',
                'rating' => 5.0,
                'location_id' => 3,
                'price' => 290000.00,
                'is_free' => false,
                'operating_hours' => json_encode(['open' => '07:00', 'close' => '17:00']),
                'checkin_count' => 10000,
                'review_count' => 7000,
                'images' => json_encode([
                    'images/checkin/halong_bay_1.jpg',
                    'images/checkin/halong_bay_2.jpg'
                ]),
                'region' => 'Bắc',
                'caption' => 'Vẻ đẹp hùng vĩ của thiên nhiên Việt Nam.',
                'distance' => 120,
                'transport_options' => json_encode(['bus', 'boat']),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
