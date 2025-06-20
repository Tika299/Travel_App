<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index($restaurantId)
    {
        $reviews = Review::where('reviewable_type', Restaurant::class)
            ->where('reviewable_id', $restaurantId)
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews->items(),
            'pagination' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total()
            ]
        ]);
    }

    public function store(Request $request, $restaurantId)
    {
        $validated = $request->validate([
            'rating' => 'required|numeric|min:1|max:5',
            'content' => 'required|string|max:1000'
        ]);

        $restaurant = Restaurant::findOrFail($restaurantId);

        $review = Review::create([
            'reviewable_type' => Restaurant::class,
            'reviewable_id' => $restaurant->id,
            'rating' => $validated['rating'],
            'content' => $validated['content'],
            'is_approved' => false // Requires admin approval
        ]);

        return response()->json([
            'success' => true,
            'data' => $review,
            'message' => 'Review submitted successfully and is pending approval'
        ], 201);
    }

    public function getStats($restaurantId)
    {
        $restaurant = Restaurant::findOrFail($restaurantId);
        
        $totalReviews = $restaurant->reviews()->count();
        $averageRating = $restaurant->reviews()->avg('rating') ?? 0;
        
        $ratingDistribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $count = $restaurant->reviews()->where('rating', $i)->count();
            $percentage = $totalReviews > 0 ? round(($count / $totalReviews) * 100) : 0;
            $ratingDistribution[$i] = [
                'count' => $count,
                'percentage' => $percentage
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total_reviews' => $totalReviews,
                'average_rating' => round($averageRating, 1),
                'rating_distribution' => $ratingDistribution
            ]
        ]);
    }
}
