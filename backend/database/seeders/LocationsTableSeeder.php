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

        Location::truncate();

        // 3. Bật lại kiểm tra khóa ngoại
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $cities = [
            [
                'name' => 'Hà Nội',
                'description' => 'Thủ đô ngàn năm văn hiến với nhiều di tích lịch sử và văn hóa.',
                'image' => 'images/cities/hanoi.jpg', // Đường dẫn giả định tới ảnh của Hà Nội
                'latitude' => 21.028511,
                'longitude' => 105.804817,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Thành phố Hồ Chí Minh',
                'description' => 'Trung tâm kinh tế sầm uất và năng động nhất phía Nam Việt Nam.',
                'image' => 'images/cities/hochiminh.jpg', // Đường dẫn giả định tới ảnh của TP.HCM
                'latitude' => 10.823099,
                'longitude' => 106.629664,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Đà Nẵng',
                'description' => 'Thành phố đáng sống với bãi biển đẹp và cầu Rồng nổi tiếng.',
                'image' => 'images/cities/danang.jpg', // Đường dẫn giả định tới ảnh của Đà Nẵng
                'latitude' => 16.054407,
                'longitude' => 108.202167,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Huế',
                'description' => 'Cố đô Huế với vẻ đẹp cổ kính, lãng mạn và di sản văn hóa thế giới.',
                'image' => 'images/cities/hue.jpg',
                'latitude' => 16.463704,
                'longitude' => 107.590867,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Nha Trang',
                'description' => 'Thành phố biển xinh đẹp với những bãi cát trắng và đảo san hô.',
                'image' => 'images/cities/nhatrang.jpg',
                'latitude' => 12.238791,
                'longitude' => 109.196749,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Chèn dữ liệu vào bảng locations
        foreach ($cities as $city) {
            Location::create($city);
        }

        $this->command->info('Locations (cities) seeded!');
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