<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all check-in places from the checkin_places table
        $checkinPlaces = DB::table('checkin_places')->get();

        foreach ($checkinPlaces as $place) {
            // Generate 100 reviews for each check-in place
            Review::factory()->count(100)->create([
                'reviewable_id' => $place->id,
                'reviewable_type' => 'App\Models\CheckinPlace', // Assuming CheckinPlace is the model name
            ])->each(function ($review) {
                $imagesCount = rand(1, 5);

                // Create associated review images
                ReviewImage::factory()->count($imagesCount)->create([
                    'review_id' => $review->id,
                ]);
            });
        }
    }
}
