<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        // Danh sách tên danh mục cố định
        $categories = [
            'Phở', 'Bún', 'Cơm', 'Bánh mì', 'Lẩu', 'Gỏi', 'Hải sản', 'Món chay'
        ];
        static $index = 0;

        return [
            'name' => $categories[$index++ % count($categories)],
            'icon' => $this->faker->randomElement(['fa-utensils', 'fa-fire', 'fa-leaf']),
            'type' => 'food'
        ];
    }
}