<?php

use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewsTableSeeder extends Seeder
{
    public function run()
    {
        Review::create([
            'user_id' => 2,
            'reviewable_type' => 'App\Models\Hotel',
            'reviewable_id' => 1,
            'content' => 'Khách sạn tuyệt vời, view biển đẹp, nhân viên thân thiện',
            'rating' => 4.8,
            'is_approved' => true
        ]);

        Review::create([
            'user_id' => 3,
            'reviewable_type' => 'App\Models\Restaurant',
            'reviewable_id' => 1,
            'content' => 'Đồ ăn ngon nhưng hơi đông khách, phải chờ lâu',
            'rating' => 3.5,
            'is_approved' => true
        ]);

        Review::create([
            'user_id' => 4,
            'reviewable_type' => 'App\Models\Location',
            'reviewable_id' => 1,
            'content' => 'Hồ Hoàn Kiếm rất đẹp về đêm, nhiều góc chụp ảnh đẹp',
            'rating' => 4.5,
            'is_approved' => true
        ]);

        Review::create([
            'user_id' => 1,
            'reviewable_type' => 'App\Models\TransportCompany',
            'reviewable_id' => 1,
            'content' => 'Tài xế Mai Linh lái xe an toàn, giá cả hợp lý',
            'rating' => 4.0,
            'is_approved' => false
        ]);

        Review::create([
            'user_id' => 2,
            'reviewable_type' => 'App\Models\Hotel',
            'reviewable_id' => 2,
            'content' => 'Phòng sạch sẽ, vị trí trung tâm thuận tiện đi lại',
            'rating' => 4.2,
            'is_approved' => true
        ]);
    }
}