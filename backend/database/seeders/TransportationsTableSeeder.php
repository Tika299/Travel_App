<?php
namespace Database\Seeders;
use App\Models\Transportation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;


class TransportationsTableSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('transportations')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        Transportation::create([
            'name' => 'Xe máy',
            'icon' => 'motorbike.svg',
            'average_price' => 20000
        ]);

        Transportation::create([
            'name' => 'Taxi',
            'icon' => 'taxi.svg',
            'average_price' => 15000 // giá/km
        ]);

        Transportation::create([
            'name' => 'Xe buýt',
            'icon' => 'bus.svg',
            'average_price' => 7000 // giá/vé
        ]);

        Transportation::create([
            'name' => 'Grab/Gọi xe',
            'icon' => 'ride-hailing.svg',
            'average_price' => 12000 // giá/km
        ]);

        Transportation::create([
            'name' => 'Xe đạp',
            'icon' => 'bicycle.svg',
            'average_price' => 10000 // thuê/giờ
        ]);
    }
}