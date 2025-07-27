<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Review::factory()->count(20)->create()->each(function ($review) {
            $imagesCount = rand(1, 5);

            ReviewImage::factory()->count($imagesCount)->create([
                'review_id' => $review->id,
            ]);
        });
    }
}
