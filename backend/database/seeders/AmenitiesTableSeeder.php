<?php

namespace Database\Seeders;
use App\Models\Amenity;
use Illuminate\Database\Seeder;

class AmenitiesTableSeeder extends Seeder
{
    public function run()
    {
        Amenity::create([
            'name' => 'Wifi miễn phí',
            'icon' => 'wifi.svg',
            'react_icon' => 'FaWifi'
        ]);

        Amenity::create([
            'name' => 'Điều hòa nhiệt độ',
            'icon' => 'air-conditioner.svg',
            'react_icon' => 'MdAcUnit'
        ]);

        Amenity::create([
            'name' => 'Hồ bơi',
            'icon' => 'pool.svg',
            'react_icon' => 'FaSwimmingPool'
        ]);

        Amenity::create([
            'name' => 'Bãi đậu xe',
            'icon' => 'parking.svg',
            'react_icon' => 'FaParking'
        ]);

        Amenity::create([
            'name' => 'Nhà hàng',
            'icon' => 'restaurant.svg',
            'react_icon' => 'FaUtensils'
        ]);

        Amenity::create([
            'name' => 'Quầy bar',
            'icon' => 'bar.svg',
            'react_icon' => 'FaCocktail'
        ]);

        Amenity::create([
            'name' => 'Spa',
            'icon' => 'spa.svg',
            'react_icon' => 'FaSpa'
        ]);

        Amenity::create([
            'name' => 'Phòng gym',
            'icon' => 'gym.svg',
            'react_icon' => 'FaDumbbell'
        ]);

        Amenity::create([
            'name' => 'Thang máy',
            'icon' => 'elevator.svg',
            'react_icon' => 'FaSortAmountUp'
        ]);

        Amenity::create([
            'name' => 'Dịch vụ phòng',
            'icon' => 'room-service.svg',
            'react_icon' => 'MdRoomService'
        ]);
    }
}