<?php
namespace Database\Seeders;

use App\Models\Hotel;

use Illuminate\Database\Seeder;

class HotelsTableSeeder extends Seeder
{
    public function run()
    {
        Hotel::create([
            'name' => 'Vinpearl Luxury Đà Nẵng',
            'description' => 'Khách sạn 5 sao ven biển Đà Nẵng',
            'address' => '07 Trường Sa, Phường Hòa Hải, Quận Ngũ Hành Sơn, Đà Nẵng',
            'latitude' => 16.0600000,
            'longitude' => 108.2500000,
            'rating' => 4.8,
            'contact_info' => 'reservation@vinpearl.com, 1900 232389',
            'wheelchair_access' => true
        ]);

        Hotel::create([
            'name' => 'InterContinental Saigon',
            'description' => 'Khách sạn cao cấp tại trung tâm TP.HCM',
            'address' => 'Corner Hai Ba Trung St. & Le Duan Blvd, District 1, TP.HCM',
            'latitude' => 10.7820000,
            'longitude' => 106.7000000,
            'rating' => 4.7,
            'contact_info' => 'reservations@icsaigon.com, 028 3520 9999',
            'wheelchair_access' => true
        ]);

        Hotel::create([
            'name' => 'Mường Thanh Luxury Sapa',
            'description' => 'Khách sạn view núi tại thị trấn Sapa',
            'address' => 'Ngũ Chỉ Sơn, Thị trấn Sapa, Lào Cai',
            'latitude' => 22.3360000,
            'longitude' => 103.8440000,
            'rating' => 4.3,
            'contact_info' => 'info@muongthanhsapa.com, 020 387 2999'
        ]);

        Hotel::create([
            'name' => 'Fusion Suite Phú Quốc',
            'description' => 'Resort sang trọng tại đảo Ngọc',
            'address' => 'Bãi Trường, Dương Tơ, Phú Quốc, Kiên Giang',
            'latitude' => 10.2230000,
            'longitude' => 103.9670000,
            'rating' => 4.6,
            'contact_info' => 'booking@fusionphuquoc.com, 029 769 9999',
            'wheelchair_access' => true
        ]);

        Hotel::create([
            'name' => 'Azerai La Residence Huế',
            'description' => 'Khách sạn di sản bên sông Hương',
            'address' => '05 Lê Lợi, Vĩnh Ninh, Thành phố Huế',
            'latitude' => 16.4700000,
            'longitude' => 107.5900000,
            'rating' => 4.5,
            'contact_info' => 'reservations@azerai.com, 023 483 7475'
        ]);
    }
}