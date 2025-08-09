<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CheckinPlace;
use App\Models\Restaurant;
use App\Models\Hotel;

class RealDataSeeder extends Seeder
{
    public function run()
    {
        // Xóa dữ liệu cũ an toàn
        \App\Models\CheckinPlace::query()->delete();
        \App\Models\Restaurant::query()->delete();
        \App\Models\Hotel::query()->delete();

        // Thêm địa điểm tham quan thực tế
        $checkinPlaces = [
            [
                'name' => 'Nhà Thờ Đức Bà Sài Gòn',
                'address' => '01 Công Xã Paris, Quận 1, TP.HCM',
                'description' => 'Nhà thờ Công giáo nổi tiếng với kiến trúc Gothic',
                'rating' => 4.5,
                'price' => 0,
                'is_free' => true,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Bảo tàng Chứng tích Chiến tranh',
                'address' => '28 Võ Văn Tần, Quận 3, TP.HCM',
                'description' => 'Bảo tàng lưu giữ chứng tích chiến tranh Việt Nam',
                'rating' => 4.3,
                'price' => 40000,
                'is_free' => false,
                'latitude' => 10.7828,
                'longitude' => 106.7008,
                'status' => 'active'
            ],
            [
                'name' => 'Dinh Độc Lập',
                'address' => '135 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM',
                'description' => 'Di tích lịch sử quan trọng của Sài Gòn',
                'rating' => 4.2,
                'price' => 65000,
                'is_free' => false,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Chợ Bến Thành',
                'address' => 'Lê Lợi, Bến Thành, Quận 1, TP.HCM',
                'description' => 'Chợ truyền thống nổi tiếng của Sài Gòn',
                'rating' => 4.0,
                'price' => 0,
                'is_free' => true,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Landmark 81',
                'address' => 'Vinhomes Central Park, Quận Bình Thạnh, TP.HCM',
                'description' => 'Tòa nhà cao nhất Việt Nam với view toàn thành phố',
                'rating' => 4.4,
                'price' => 250000,
                'is_free' => false,
                'latitude' => 10.7833,
                'longitude' => 106.7167,
                'status' => 'active'
            ],
            [
                'name' => 'Công viên Tao Đàn',
                'address' => 'Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
                'description' => 'Công viên xanh mát giữa lòng thành phố',
                'rating' => 4.1,
                'price' => 0,
                'is_free' => true,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Phố đi bộ Bùi Viện',
                'address' => 'Bùi Viện, Quận 1, TP.HCM',
                'description' => 'Phố đi bộ sôi động về đêm',
                'rating' => 3.8,
                'price' => 0,
                'is_free' => true,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Bảo tàng Dân tộc học',
                'address' => 'Nguyễn Văn Huyên, Cầu Giấy, Hà Nội',
                'description' => 'Bảo tàng về văn hóa các dân tộc Việt Nam',
                'rating' => 4.6,
                'price' => 40000,
                'is_free' => false,
                'latitude' => 21.0285,
                'longitude' => 105.8542,
                'status' => 'active'
            ],
            [
                'name' => 'Hoàn Kiếm',
                'address' => 'Hoàn Kiếm, Hà Nội',
                'description' => 'Hồ nổi tiếng với tháp Rùa và cầu Thê Húc',
                'rating' => 4.3,
                'price' => 0,
                'is_free' => true,
                'latitude' => 21.0285,
                'longitude' => 105.8542,
                'status' => 'active'
            ],
            [
                'name' => 'Vịnh Hạ Long',
                'address' => 'Hạ Long, Quảng Ninh',
                'description' => 'Kỳ quan thiên nhiên thế giới',
                'rating' => 4.8,
                'price' => 300000,
                'is_free' => false,
                'latitude' => 20.9101,
                'longitude' => 107.1839,
                'status' => 'active'
            ],
            [
                'name' => 'Phố Cổ Hội An',
                'address' => 'Phố cổ Hội An, Quảng Nam',
                'description' => 'Di sản văn hóa thế giới với kiến trúc cổ',
                'rating' => 4.7,
                'price' => 120000,
                'is_free' => false,
                'latitude' => 15.8801,
                'longitude' => 108.3383,
                'status' => 'active'
            ],
            [
                'name' => 'Đà Lạt - Thành phố ngàn hoa',
                'address' => 'Đà Lạt, Lâm Đồng',
                'description' => 'Thành phố mộng mơ với khí hậu mát mẻ',
                'rating' => 4.5,
                'price' => 0,
                'is_free' => true,
                'latitude' => 11.9404,
                'longitude' => 108.4583,
                'status' => 'active'
            ],
            [
                'name' => 'Cung điện Hoàng Thành Huế',
                'address' => 'Thành phố Huế, Thừa Thiên Huế',
                'description' => 'Di tích cố đô Huế với kiến trúc cổ kính',
                'rating' => 4.4,
                'price' => 150000,
                'is_free' => false,
                'latitude' => 16.4637,
                'longitude' => 107.5909,
                'status' => 'active'
            ],
            [
                'name' => 'Bãi biển Mỹ Khê',
                'address' => 'Mỹ Khê, Sơn Trà, Đà Nẵng',
                'description' => 'Một trong những bãi biển đẹp nhất thế giới',
                'rating' => 4.6,
                'price' => 0,
                'is_free' => true,
                'latitude' => 16.0544,
                'longitude' => 108.2022,
                'status' => 'active'
            ],
            [
                'name' => 'Sa Pa',
                'address' => 'Sa Pa, Lào Cai',
                'description' => 'Thị trấn núi cao với ruộng bậc thang',
                'rating' => 4.3,
                'price' => 0,
                'is_free' => true,
                'latitude' => 22.3366,
                'longitude' => 103.8444,
                'status' => 'active'
            ],
            [
                'name' => 'Bảo tàng Mỹ thuật TP.HCM',
                'address' => '97A Phó Đức Chính, Quận 1, TP.HCM',
                'description' => 'Bảo tàng nghệ thuật với nhiều tác phẩm quý',
                'rating' => 4.2,
                'price' => 30000,
                'is_free' => false,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Công viên Văn hóa Đầm Sen',
                'address' => '3 Hòa Bình, Quận 11, TP.HCM',
                'description' => 'Công viên giải trí lớn với nhiều trò chơi',
                'rating' => 4.0,
                'price' => 120000,
                'is_free' => false,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Suối Tiên',
                'address' => '120 Xa lộ Hà Nội, Quận 9, TP.HCM',
                'description' => 'Công viên nước và giải trí nổi tiếng',
                'rating' => 3.9,
                'price' => 150000,
                'is_free' => false,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Bảo tàng Lịch sử Việt Nam',
                'address' => '2 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM',
                'description' => 'Bảo tàng lịch sử với kiến trúc cổ kính',
                'rating' => 4.1,
                'price' => 20000,
                'is_free' => false,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Công viên 23/9',
                'address' => 'Lê Lai, Quận 1, TP.HCM',
                'description' => 'Công viên trung tâm với không gian xanh',
                'rating' => 3.8,
                'price' => 0,
                'is_free' => true,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Bảo tàng Áo Dài',
                'address' => '206/19/30 Long Thuận, Quận 9, TP.HCM',
                'description' => 'Bảo tàng trưng bày áo dài truyền thống',
                'rating' => 4.0,
                'price' => 50000,
                'is_free' => false,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Công viên Gia Định',
                'address' => 'Hoàng Văn Thụ, Quận Tân Bình, TP.HCM',
                'description' => 'Công viên xanh mát với hồ nước',
                'rating' => 3.7,
                'price' => 0,
                'is_free' => true,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ]
        ];

        foreach ($checkinPlaces as $place) {
            CheckinPlace::create($place);
        }

        // Thêm nhà hàng thực tế
        $restaurants = [
            [
                'name' => 'Nhà hàng Ngon',
                'address' => '160 Pasteur, Quận 1, TP.HCM',
                'description' => 'Nhà hàng ẩm thực Việt Nam truyền thống',
                'rating' => 4.2,
                'price_range' => 'medium',
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'La Verticale',
                'address' => '19 Ngô Văn Sở, Hoàn Kiếm, Hà Nội',
                'description' => 'Nhà hàng Pháp sang trọng',
                'rating' => 4.5,
                'price_range' => 'high',
                'latitude' => 21.0285,
                'longitude' => 105.8542,
                'status' => 'active'
            ],
            [
                'name' => 'Bếp Mẹ Ỉn',
                'address' => '10 Nguyễn Thị Minh Khai, Huế',
                'description' => 'Nhà hàng ẩm thực Huế truyền thống',
                'rating' => 4.3,
                'price_range' => 'medium',
                'latitude' => 16.4637,
                'longitude' => 107.5909,
                'status' => 'active'
            ],
            [
                'name' => 'Quán Ăn Ngon Đà Nẵng',
                'address' => 'Lô 12-13 Võ Nguyên Giáp, Đà Nẵng',
                'description' => 'Nhà hàng ẩm thực miền Trung',
                'rating' => 4.1,
                'price_range' => 'medium',
                'latitude' => 16.0544,
                'longitude' => 108.2022,
                'status' => 'active'
            ],
            [
                'name' => 'The Deck Saigon',
                'address' => '38 Nguyễn Ư Dĩ, Quận 2, TP.HCM',
                'description' => 'Nhà hàng view sông Sài Gòn',
                'rating' => 4.4,
                'price_range' => 'high',
                'latitude' => 10.7833,
                'longitude' => 106.7167,
                'status' => 'active'
            ],
            [
                'name' => 'Quán Cơm Tấm Sài Gòn',
                'address' => '32 Võ Văn Tần, Quận 3, TP.HCM',
                'description' => 'Quán cơm tấm nổi tiếng',
                'rating' => 4.0,
                'price_range' => 'low',
                'latitude' => 10.7828,
                'longitude' => 106.7008,
                'status' => 'active'
            ],
            [
                'name' => 'Nhà hàng Hải Sản Biển Đông',
                'address' => '45 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
                'description' => 'Nhà hàng hải sản tươi ngon',
                'rating' => 4.2,
                'price_range' => 'medium',
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Quán Phở Hòa',
                'address' => '260C Pasteur, Quận 3, TP.HCM',
                'description' => 'Quán phở truyền thống',
                'rating' => 4.1,
                'price_range' => 'low',
                'latitude' => 10.7828,
                'longitude' => 106.7008,
                'status' => 'active'
            ],
            [
                'name' => 'Nhà hàng L\'Usine Le Loi',
                'address' => '70B Lê Lợi, Quận 1, TP.HCM',
                'description' => 'Nhà hàng fusion ẩm thực',
                'rating' => 4.3,
                'price_range' => 'medium',
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Phở Hà Nội',
                'address' => '25 Lý Quốc Sư, Hoàn Kiếm, Hà Nội',
                'description' => 'Phở Hà Nội chính gốc',
                'rating' => 4.4,
                'price_range' => 'low',
                'latitude' => 21.0285,
                'longitude' => 105.8542,
                'status' => 'active'
            ],
            [
                'name' => 'Nhà hàng An Vị',
                'address' => '168 Võ Văn Tần, Quận 3, TP.HCM',
                'description' => 'Nhà hàng ẩm thực Việt Nam truyền thống',
                'rating' => 4.3,
                'price_range' => 'medium',
                'latitude' => 10.7828,
                'longitude' => 106.7008,
                'status' => 'active'
            ],
            [
                'name' => 'Quán Cơm Tấm Cali',
                'address' => '27 Nguyễn Đình Chiểu, Quận 1, TP.HCM',
                'description' => 'Quán cơm tấm nổi tiếng với thịt nướng',
                'rating' => 4.1,
                'price_range' => 'low',
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Nhà hàng Hải Sản 3 Miền',
                'address' => '89 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
                'description' => 'Nhà hàng hải sản tươi ngon',
                'rating' => 4.2,
                'price_range' => 'medium',
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Quán Bún Bò Huế',
                'address' => '15 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
                'description' => 'Bún bò Huế chính gốc',
                'rating' => 4.0,
                'price_range' => 'low',
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Nhà hàng L\'Usine Dong Khoi',
                'address' => '151/1 Đồng Khởi, Quận 1, TP.HCM',
                'description' => 'Nhà hàng fusion ẩm thực hiện đại',
                'rating' => 4.4,
                'price_range' => 'high',
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Quán Cơm Niêu',
                'address' => '45 Võ Văn Tần, Quận 3, TP.HCM',
                'description' => 'Cơm niêu truyền thống',
                'rating' => 3.9,
                'price_range' => 'low',
                'latitude' => 10.7828,
                'longitude' => 106.7008,
                'status' => 'active'
            ],
            [
                'name' => 'Nhà hàng Hội An',
                'address' => '76 Lê Lợi, Quận 1, TP.HCM',
                'description' => 'Nhà hàng ẩm thực miền Trung',
                'rating' => 4.1,
                'price_range' => 'medium',
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Quán Bánh Mì Huỳnh Hoa',
                'address' => '26 Lê Thị Riêng, Quận 1, TP.HCM',
                'description' => 'Bánh mì nổi tiếng Sài Gòn',
                'rating' => 4.3,
                'price_range' => 'low',
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Nhà hàng Chay Thiện Duyên',
                'address' => '12 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
                'description' => 'Nhà hàng chay thanh tịnh',
                'rating' => 4.0,
                'price_range' => 'medium',
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ]
        ];

        foreach ($restaurants as $restaurant) {
            Restaurant::create($restaurant);
        }

        // Thêm khách sạn thực tế
        $hotels = [
            [
                'name' => 'Vinpearl Luxury Đà Nẵng',
                'address' => '07 Trường Sa, Đà Nẵng',
                'description' => 'Khách sạn 5 sao với view biển tuyệt đẹp',
                'rating' => 4.6,
                'latitude' => 16.0544,
                'longitude' => 108.2022,
                'status' => 'active'
            ],
            [
                'name' => 'InterContinental Saigon',
                'address' => 'Corner Hai Ba Trung St. & Le Duan Blvd, TP.HCM',
                'description' => 'Khách sạn 5 sao quốc tế',
                'rating' => 4.7,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Mường Thanh Luxury Sapa',
                'address' => 'Ngũ Chỉ Sơn, Sapa, Lào Cai',
                'description' => 'Khách sạn cao cấp tại Sapa',
                'rating' => 4.4,
                'latitude' => 22.3366,
                'longitude' => 103.8444,
                'status' => 'active'
            ],
            [
                'name' => 'Fusion Suite Phú Quốc',
                'address' => 'Bãi Trường, Phú Quốc, Kiên Giang',
                'description' => 'Resort sang trọng tại đảo ngọc',
                'rating' => 4.5,
                'latitude' => 10.2167,
                'longitude' => 103.9667,
                'status' => 'active'
            ],
            [
                'name' => 'Azerai La Residence Huế',
                'address' => '05 Lê Lợi, Huế',
                'description' => 'Khách sạn boutique tại cố đô',
                'rating' => 4.3,
                'latitude' => 16.4637,
                'longitude' => 107.5909,
                'status' => 'active'
            ],
            [
                'name' => 'Rex Hotel Saigon',
                'address' => '141 Nguyễn Huệ, Quận 1, TP.HCM',
                'description' => 'Khách sạn lịch sử của Sài Gòn',
                'rating' => 4.2,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Caravelle Hotel',
                'address' => '19 Lam Sơn, Quận 1, TP.HCM',
                'description' => 'Khách sạn 5 sao trung tâm',
                'rating' => 4.5,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Park Hyatt Saigon',
                'address' => '2 Lam Sơn, Quận 1, TP.HCM',
                'description' => 'Khách sạn sang trọng bậc nhất',
                'rating' => 4.8,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Hotel Majestic Saigon',
                'address' => '1 Đồng Khởi, Quận 1, TP.HCM',
                'description' => 'Khách sạn cổ điển bên sông',
                'rating' => 4.3,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Hanoi Imperial Hotel',
                'address' => '44 Hàng Bài, Hoàn Kiếm, Hà Nội',
                'description' => 'Khách sạn 4 sao trung tâm Hà Nội',
                'rating' => 4.1,
                'latitude' => 21.0285,
                'longitude' => 105.8542,
                'status' => 'active'
            ],
            [
                'name' => 'Sheraton Saigon Hotel',
                'address' => '88 Đồng Khởi, Quận 1, TP.HCM',
                'description' => 'Khách sạn 5 sao quốc tế trung tâm',
                'rating' => 4.6,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Sofitel Saigon Plaza',
                'address' => '17 Lê Duẩn, Quận 1, TP.HCM',
                'description' => 'Khách sạn 5 sao sang trọng',
                'rating' => 4.7,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Renaissance Riverside Hotel',
                'address' => '15-17 Tôn Đức Thắng, Quận 1, TP.HCM',
                'description' => 'Khách sạn view sông Sài Gòn',
                'rating' => 4.4,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Novotel Saigon Centre',
                'address' => '167 Hai Bà Trưng, Quận 3, TP.HCM',
                'description' => 'Khách sạn 4 sao hiện đại',
                'rating' => 4.2,
                'latitude' => 10.7828,
                'longitude' => 106.7008,
                'status' => 'active'
            ],
            [
                'name' => 'Pullman Saigon Centre',
                'address' => '148 Trần Hưng Đạo, Quận 1, TP.HCM',
                'description' => 'Khách sạn 5 sao cao cấp',
                'rating' => 4.5,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Grand Hotel Saigon',
                'address' => '8 Đồng Khởi, Quận 1, TP.HCM',
                'description' => 'Khách sạn cổ điển với kiến trúc Pháp',
                'rating' => 4.3,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Hotel Nikko Saigon',
                'address' => '235 Nguyễn Văn Cừ, Quận 1, TP.HCM',
                'description' => 'Khách sạn Nhật Bản cao cấp',
                'rating' => 4.4,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Rex Hotel Saigon',
                'address' => '141 Nguyễn Huệ, Quận 1, TP.HCM',
                'description' => 'Khách sạn lịch sử của Sài Gòn',
                'rating' => 4.2,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Liberty Central Saigon Riverside',
                'address' => '17 Tôn Đức Thắng, Quận 1, TP.HCM',
                'description' => 'Khách sạn view sông hiện đại',
                'rating' => 4.1,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ],
            [
                'name' => 'Hotel Continental Saigon',
                'address' => '132-134 Đồng Khởi, Quận 1, TP.HCM',
                'description' => 'Khách sạn lịch sử với kiến trúc cổ',
                'rating' => 4.0,
                'latitude' => 10.7769,
                'longitude' => 106.7009,
                'status' => 'active'
            ]
        ];

        foreach ($hotels as $hotel) {
            Hotel::create($hotel);
        }

        echo "✅ Đã thêm dữ liệu thực tế thành công!\n";
        echo "- " . count($checkinPlaces) . " địa điểm tham quan\n";
        echo "- " . count($restaurants) . " nhà hàng\n";
        echo "- " . count($hotels) . " khách sạn\n";
    }
} 