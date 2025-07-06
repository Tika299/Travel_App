<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationsTableSeeder extends Seeder
{
    public function run()
    {
        Location::create([
            'name' => 'Hồ Hoàn Kiếm',
            'description' => 'Hồ nước nổi tiếng ở trung tâm Hà Nội',
            'address' => 'Hàng Trống, Hoàn Kiếm, Hà Nội',
            'latitude' => 21.028611,
            'longitude' => 105.852222,
            'checkin_count' => 15000,
            'rating' => 4.8,
            'has_fee' => false,
            'category' => 'Danh lam thắng cảnh'
        ]);

        Location::create([
            'name' => 'Bảo tàng Chứng tích Chiến tranh',
            'description' => 'Bảo tàng trưng bày hiện vật về chiến tranh Việt Nam',
            'address' => '28 Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
            'latitude' => 10.779444,
            'longitude' => 106.692500,
            'checkin_count' => 8500,
            'rating' => 4.6,
            'has_fee' => true,
            'category' => 'Bảo tàng'
        ]);

        Location::create([
            'name' => 'Bãi biển Mỹ Khê',
            'description' => 'Bãi biển đẹp nhất Đà Nẵng với cát trắng mịn',
            'address' => 'Phước Mỹ, Sơn Trà, Đà Nẵng',
            'latitude' => 16.061667,
            'longitude' => 108.247500,
            'checkin_count' => 21000,
            'rating' => 4.7,
            'has_fee' => false,
            'category' => 'Bãi biển'
        ]);

        Location::create([
            'name' => 'Núi LangBiang',
            'description' => 'Ngọn núi cao nhất Đà Lạt với view toàn cảnh',
            'address' => 'Lạc Dương, Lâm Đồng',
            'latitude' => 12.026667,
            'longitude' => 108.430000,
            'checkin_count' => 6800,
            'rating' => 4.5,
            'has_fee' => true,
            'category' => 'Núi'
        ]);

        Location::create([
            'name' => 'Phố cổ Hội An',
            'description' => 'Khu phố cổ được UNESCO công nhận di sản thế giới',
            'address' => 'Hội An, Quảng Nam',
            'latitude' => 15.877222,
            'longitude' => 108.325278,
            'checkin_count' => 25000,
            'rating' => 4.9,
            'has_fee' => false,
            'category' => 'Di sản'
        ]);
    }
}
<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;


class LocationsTableSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('locations')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        Location::create([
            'name' => 'Hồ Hoàn Kiếm',
            'description' => 'Hồ nước nổi tiếng ở trung tâm Hà Nội',
            'address' => 'Hàng Trống, Hoàn Kiếm, Hà Nội',
            'latitude' => 21.028611,
            'longitude' => 105.852222,
            'checkin_count' => 15000,
            'rating' => 4.8,
            'has_fee' => false,
            'category' => 'Danh lam thắng cảnh',
            'image' => 'Ho-Hoan-Kiem.jpg'
        ]);

        Location::create([
            'name' => 'Bảo tàng Chứng tích Chiến tranh',
            'description' => 'Bảo tàng trưng bày hiện vật về chiến tranh Việt Nam',
            'address' => '28 Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
            'latitude' => 10.779444,
            'longitude' => 106.692500,
            'checkin_count' => 8500,
            'rating' => 4.6,
            'has_fee' => true,
            'category' => 'Bảo tàng',
            'image' => 'Bao-tang-trung-bay.jpg'
        ]);

        Location::create([
            'name' => 'Bãi biển Mỹ Khê',
            'description' => 'Bãi biển đẹp nhất Đà Nẵng với cát trắng mịn',
            'address' => 'Phước Mỹ, Sơn Trà, Đà Nẵng',
            'latitude' => 16.061667,
            'longitude' => 108.247500,
            'checkin_count' => 21000,
            'rating' => 4.7,
            'has_fee' => false,
            'category' => 'Bãi biển',
            'image' => 'dau-la-bai-bien-dep-nhat-da-nang.jpg'
        ]);

        Location::create([
            'name' => 'Núi LangBiang',
            'description' => 'Ngọn núi cao nhất Đà Lạt với view toàn cảnh',
            'address' => 'Lạc Dương, Lâm Đồng',
            'latitude' => 12.026667,
            'longitude' => 108.430000,
            'checkin_count' => 6800,
            'rating' => 4.5,
            'has_fee' => true,
            'category' => 'Núi',
            'image' => 'dinh-langbiang-da-lat.jpg'
        ]);

        Location::create([
            'name' => 'Phố cổ Hội An',
            'description' => 'Khu phố cổ được UNESCO công nhận di sản thế giới',
            'address' => 'Hội An, Quảng Nam',
            'latitude' => 15.877222,
            'longitude' => 108.325278,
            'checkin_count' => 25000,
            'rating' => 3.9,
            'has_fee' => false,
            'category' => 'Di sản',
            'image' => 'pho-co-hoi-an.jpg'
        ]);
    }
}