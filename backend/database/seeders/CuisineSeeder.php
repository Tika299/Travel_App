<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Cuisine;

class CuisineSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Xóa dữ liệu cũ (nếu muốn)
        Cuisine::query()->delete();
        Category::query()->delete();

        // 2. Tạo 8 danh mục cố định
        // Chúng ta dùng create() thay vì factory() để có dữ liệu chính xác
        $categoriesData = [
            ['name' => 'Phở', 'icon' => 'fa-utensils', 'type' => 'food'],
            ['name' => 'Bún', 'icon' => 'fa-bacon', 'type' => 'food'],
            ['name' => 'Cơm', 'icon' => 'fa-concierge-bell', 'type' => 'food'],
            ['name' => 'Bánh mì', 'icon' => 'fa-bread-slice', 'type' => 'food'],
            ['name' => 'Lẩu', 'icon' => 'fa-hot-tub', 'type' => 'food'],
            ['name' => 'Gỏi', 'icon' => 'fa-leaf', 'type' => 'food'],
            ['name' => 'Hải sản', 'icon' => 'fa-fish', 'type' => 'food'],
            ['name' => 'Món chay', 'icon' => 'fa-carrot', 'type' => 'food'],
        ];

        foreach ($categoriesData as $data) {
            Category::create($data);
        }

        // Lấy lại tất cả các category đã tạo
        $categories = Category::all();

        // 3. Tạo 50 món ăn, mỗi món thuộc về một danh mục ngẫu nhiên
        Cuisine::factory()->count(50)->make()->each(function ($cuisine) use ($categories) {
            // Gán categories_id bằng id của một category ngẫu nhiên
            $cuisine->categories_id = $categories->random()->id;
            $cuisine->save();
        });
    }
}