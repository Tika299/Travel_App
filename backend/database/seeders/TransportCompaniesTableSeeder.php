<?php
namespace Database\Seeders;
use App\Models\TransportCompany;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransportCompaniesTableSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('transport_companies')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        TransportCompany::create([
            'transportation_id' => 2,
            'name' => 'Mai Linh Taxi',
            'contact_info' => '028 3838 3838',
            'address' => '45 Trường Sơn, Phường 2, Quận Tân Bình, TP.HCM',
            'latitude' => 10.797222,
            'longitude' => 106.652500,
            'description' => 'Hãng taxi uy tín hàng đầu Việt Nam',
            'logo' => 'mai-linh.png',
            'operating_hours' => json_encode(['open' => '00:00', 'close' => '23:59']),
            'rating' => 4.3
        ]);

        TransportCompany::create([
            'transportation_id' => 2,
            'name' => 'Vinasun Taxi',
            'contact_info' => '028 3827 2727',
            'address' => '152 Lê Thánh Tôn, Bến Thành, Quận 1, TP.HCM',
            'latitude' => 10.772222,
            'longitude' => 106.700833,
            'description' => 'Dịch vụ taxi chất lượng cao',
            'logo' => 'vinasun.png',
            'operating_hours' => json_encode(['open' => '00:00', 'close' => '23:59']),
            'rating' => 4.2
        ]);

        TransportCompany::create([
            'transportation_id' => 4,
            'name' => 'Grab Vietnam',
            'contact_info' => '1900 2089',
            'address' => 'Tòa nhà Viettel, 285 Cách Mạng Tháng 8, Quận 10, TP.HCM',
            'latitude' => 10.772778,
            'longitude' => 106.669722,
            'description' => 'Ứng dụng đặt xe công nghệ',
            'logo' => 'grab.png',
            'operating_hours' => json_encode(['open' => '00:00', 'close' => '23:59']),
            'rating' => 4.5
        ]);

        TransportCompany::create([
            'transportation_id' => 3,
            'name' => 'Xe buýt Sài Gòn',
            'contact_info' => '028 3824 4444',
            'address' => '319 Lý Thường Kiệt, Phường 15, Quận 11, TP.HCM',
            'latitude' => 10.763889,
            'longitude' => 106.651389,
            'description' => 'Hệ thống xe buýt công cộng TP.HCM',
            'logo' => 'bus-saigon.png',
            'operating_hours' => json_encode(['open' => '05:00', 'close' => '21:00']),
            'rating' => 3.8
        ]);

        TransportCompany::create([
            'transportation_id' => 1,
            'name' => 'RentABike',
            'contact_info' => '0909 123 456',
            'address' => '22 Nguyễn Thị Minh Khai, Đa Kao, Quận 1, TP.HCM',
            'latitude' => 10.788889,
            'longitude' => 106.700000,
            'description' => 'Dịch vụ cho thuê xe máy du lịch',
            'logo' => 'rentabike.png',
            'operating_hours' => json_encode(['open' => '07:00', 'close' => '20:00']),
            'rating' => 4.0
        ]);
    }
}