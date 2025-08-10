<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\CheckinPlace;
use App\Models\Hotel;
use App\Models\Restaurant;

echo "Adding real data for Ho Chi Minh City...\n\n";

try {
    // Clear existing data
    CheckinPlace::truncate();
    Hotel::truncate();
    Restaurant::truncate();
    
    echo "Cleared existing data.\n\n";
    
    // Add checkin places (địa điểm)
    $checkinPlaces = [
        [
            'name' => 'Bến Nhà Rồng',
            'description' => 'Bảo tàng Hồ Chí Minh, nơi Bác Hồ ra đi tìm đường cứu nước',
            'address' => '1 Nguyễn Tất Thành, Quận 4, TP.HCM',
            'latitude' => 10.7681,
            'longitude' => 106.7069,
            'region' => 'TP. Hồ Chí Minh',
            'price' => 0,
            'is_free' => 1,
            'status' => 'active'
        ],
        [
            'name' => 'Dinh Độc Lập',
            'description' => 'Di tích lịch sử quan trọng, nơi kết thúc chiến tranh Việt Nam',
            'address' => '135 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM',
            'latitude' => 10.7769,
            'longitude' => 106.6954,
            'region' => 'TP. Hồ Chí Minh',
            'price' => 40000,
            'is_free' => 0,
            'status' => 'active'
        ],
        [
            'name' => 'Nhà thờ Đức Bà',
            'description' => 'Nhà thờ Công giáo nổi tiếng với kiến trúc Gothic',
            'address' => '1 Công xã Paris, Quận 1, TP.HCM',
            'latitude' => 10.7797,
            'longitude' => 106.6992,
            'region' => 'TP. Hồ Chí Minh',
            'price' => 0,
            'is_free' => 1,
            'status' => 'active'
        ],
        [
            'name' => 'Bảo tàng Chứng tích Chiến tranh',
            'description' => 'Bảo tàng trưng bày các hiện vật về chiến tranh Việt Nam',
            'address' => '28 Võ Văn Tần, Quận 3, TP.HCM',
            'latitude' => 10.7797,
            'longitude' => 106.6907,
            'region' => 'TP. Hồ Chí Minh',
            'price' => 40000,
            'is_free' => 0,
            'status' => 'active'
        ],
        [
            'name' => 'Phố đi bộ Bùi Viện',
            'description' => 'Phố đi bộ sôi động với nhiều quán bar, nhà hàng',
            'address' => 'Bùi Viện, Quận 1, TP.HCM',
            'latitude' => 10.7631,
            'longitude' => 106.6907,
            'region' => 'TP. Hồ Chí Minh',
            'price' => 0,
            'is_free' => 1,
            'status' => 'active'
        ],
        [
            'name' => 'Chợ Bến Thành',
            'description' => 'Chợ truyền thống nổi tiếng với nhiều mặt hàng đặc trưng',
            'address' => 'Lê Lợi, Quận 1, TP.HCM',
            'latitude' => 10.7720,
            'longitude' => 106.6983,
            'region' => 'TP. Hồ Chí Minh',
            'price' => 0,
            'is_free' => 1,
            'status' => 'active'
        ]
    ];
    
    foreach ($checkinPlaces as $place) {
        CheckinPlace::create($place);
    }
    echo "Added " . count($checkinPlaces) . " checkin places.\n";
    
    // Add hotels (khách sạn)
    $hotels = [
        [
            'name' => 'Khách sạn Continental Saigon',
            'description' => 'Khách sạn 5 sao lịch sử tại trung tâm TP.HCM',
            'address' => '132-134 Đồng Khởi, Quận 1, TP.HCM',
            'latitude' => 10.7769,
            'longitude' => 106.6992,
            'email' => 'info@continental.com.vn',
            'phone' => '028 3829 9201',
            'website' => 'https://continental.com.vn'
        ],
        [
            'name' => 'Khách sạn Rex',
            'description' => 'Khách sạn 5 sao nổi tiếng với rooftop bar',
            'address' => '141 Nguyễn Huệ, Quận 1, TP.HCM',
            'latitude' => 10.7769,
            'longitude' => 106.6992,
            'email' => 'info@rexhotelvietnam.com',
            'phone' => '028 3829 2185',
            'website' => 'https://rexhotelvietnam.com'
        ],
        [
            'name' => 'Khách sạn Caravelle',
            'description' => 'Khách sạn 5 sao với view đẹp ra sông Sài Gòn',
            'address' => '19 Lam Sơn, Quận 1, TP.HCM',
            'latitude' => 10.7769,
            'longitude' => 106.6992,
            'email' => 'info@caravellehotel.com',
            'phone' => '028 3824 5555',
            'website' => 'https://caravellehotel.com'
        ],
        [
            'name' => 'Khách sạn Park Hyatt',
            'description' => 'Khách sạn 5 sao sang trọng tại Landmark 81',
            'address' => 'Vinhomes Central Park, Quận Bình Thạnh, TP.HCM',
            'latitude' => 10.7951,
            'longitude' => 106.7219,
            'email' => 'info@parkhyattsaigon.com',
            'phone' => '028 3520 2355',
            'website' => 'https://parkhyattsaigon.com'
        ],
        [
            'name' => 'Khách sạn Sheraton',
            'description' => 'Khách sạn 5 sao quốc tế tại trung tâm',
            'address' => '88 Đồng Khởi, Quận 1, TP.HCM',
            'latitude' => 10.7769,
            'longitude' => 106.6992,
            'email' => 'info@sheratonsaigon.com',
            'phone' => '028 3827 2828',
            'website' => 'https://sheratonsaigon.com'
        ]
    ];
    
    foreach ($hotels as $hotel) {
        Hotel::create($hotel);
    }
    echo "Added " . count($hotels) . " hotels.\n";
    
    // Add restaurants (nhà hàng)
    $restaurants = [
        [
            'name' => 'Nhà hàng Ngon',
            'description' => 'Nhà hàng ẩm thực Việt Nam truyền thống',
            'address' => '160 Pasteur, Quận 1, TP.HCM',
            'latitude' => 10.7769,
            'longitude' => 106.6992,
            'rating' => 4.5,
            'price_range' => '200,000 - 500,000 VND'
        ],
        [
            'name' => 'Nhà hàng Quán Ăn Ngon',
            'description' => 'Chuỗi nhà hàng ẩm thực Việt Nam nổi tiếng',
            'address' => '160 Pasteur, Quận 1, TP.HCM',
            'latitude' => 10.7769,
            'longitude' => 106.6992,
            'rating' => 4.3,
            'price_range' => '150,000 - 400,000 VND'
        ],
        [
            'name' => 'Nhà hàng Hoa Túc',
            'description' => 'Nhà hàng ẩm thực chay cao cấp',
            'address' => '74 Hai Bà Trưng, Quận 1, TP.HCM',
            'latitude' => 10.7769,
            'longitude' => 106.6992,
            'rating' => 4.7,
            'price_range' => '300,000 - 800,000 VND'
        ],
        [
            'name' => 'Nhà hàng Cục Gạch Quán',
            'description' => 'Nhà hàng ẩm thực Việt Nam với không gian độc đáo',
            'address' => '10 Dang Tat, Quận 1, TP.HCM',
            'latitude' => 10.7769,
            'longitude' => 106.6992,
            'rating' => 4.4,
            'price_range' => '200,000 - 600,000 VND'
        ],
        [
            'name' => 'Nhà hàng Secret Garden',
            'description' => 'Nhà hàng rooftop với view đẹp thành phố',
            'address' => '158 Pasteur, Quận 1, TP.HCM',
            'latitude' => 10.7769,
            'longitude' => 106.6992,
            'rating' => 4.6,
            'price_range' => '400,000 - 1,200,000 VND'
        ],
        [
            'name' => 'Nhà hàng L\'Usine Le Loi',
            'description' => 'Nhà hàng phong cách châu Âu với không gian đẹp',
            'address' => '70B Lê Lợi, Quận 1, TP.HCM',
            'latitude' => 10.7769,
            'longitude' => 106.6992,
            'rating' => 4.2,
            'price_range' => '250,000 - 700,000 VND'
        ],
        [
            'name' => 'Nhà hàng Propaganda',
            'description' => 'Nhà hàng ẩm thực Việt Nam hiện đại',
            'address' => '21 Han Thuyen, Quận 1, TP.HCM',
            'latitude' => 10.7769,
            'longitude' => 106.6992,
            'rating' => 4.3,
            'price_range' => '180,000 - 450,000 VND'
        ],
        [
            'name' => 'Nhà hàng The Refinery',
            'description' => 'Nhà hàng phong cách Pháp với rượu vang ngon',
            'address' => '74 Hai Ba Trung, Quận 1, TP.HCM',
            'latitude' => 10.7769,
            'longitude' => 106.6992,
            'rating' => 4.5,
            'price_range' => '350,000 - 900,000 VND'
        ]
    ];
    
    foreach ($restaurants as $restaurant) {
        Restaurant::create($restaurant);
    }
    echo "Added " . count($restaurants) . " restaurants.\n\n";
    
    echo "✅ Successfully added real data for Ho Chi Minh City!\n";
    echo "📊 Summary:\n";
    echo "- Checkin Places: " . CheckinPlace::count() . "\n";
    echo "- Hotels: " . Hotel::count() . "\n";
    echo "- Restaurants: " . Restaurant::count() . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>


