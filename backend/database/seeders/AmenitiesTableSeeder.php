<?php

use App\Models\Amenity;
use Illuminate\Database\Seeder;

class AmenitiesTableSeeder extends Seeder
{
    public function run()
    {
        Amenity::create([
            'name' => 'Wifi miễn phí',
            'icon' => 'wifi.svg'
        ]);

        Amenity::create([
            'name' => 'Điều hòa nhiệt độ',
            'icon' => 'air-conditioner.svg'
        ]);

        Amenity::create([
            'name' => 'Hồ bơi',
            'icon' => 'pool.svg'
        ]);

        Amenity::create([
            'name' => 'Bãi đậu xe',
            'icon' => 'parking.svg'
        ]);

        Amenity::create([
            'name' => 'Nhà hàng',
            'icon' => 'restaurant.svg'
        ]);

        Amenity::create([
            'name' => 'Quầy bar',
            'icon' => 'bar.svg'
        ]);

        Amenity::create([
            'name' => 'Spa',
            'icon' => 'spa.svg'
        ]);

        Amenity::create([
            'name' => 'Phòng gym',
            'icon' => 'gym.svg'
        ]);

        Amenity::create([
            'name' => 'Thang máy',
            'icon' => 'elevator.svg'
        ]);

        Amenity::create([
            'name' => 'Dịch vụ phòng',
            'icon' => 'room-service.svg'
        ]);
    }
}