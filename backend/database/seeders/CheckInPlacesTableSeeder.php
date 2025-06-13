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
                'address' => 'Bà Nà Hills, Đà Nẵng',
                'latitude' => 16.0021,
                'longitude' => 108.0655,
                'image' => 'images/checkin/golden_bridge.jpg',
                'rating' => 4.8,
                'location_id' => 1, // nhớ chỉnh đúng id location nếu có
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
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
