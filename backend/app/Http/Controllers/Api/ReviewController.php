<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Location;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with(['user', 'images', 'interactions'])
            ->where('is_approved', true);

        if ($request->has('reviewable_type') && $request->has('reviewable_id')) {
            $query->where('reviewable_type', $request->reviewable_type)
                  ->where('reviewable_id', $request->reviewable_id);
        }

        $reviews = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews
]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'reviewable_type' => 'required|string',
            'reviewable_id' => 'required|integer',
            'content' => 'required|string|max:1000',
            'rating' => 'required|numeric|min:1|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'webcam_images.*' => 'string'
        ]);

        $review = Review::create([
            'user_id' => Auth::id(),
            'reviewable_type' => $request->reviewable_type,
            'reviewable_id' => $request->reviewable_id,
            'content' => $request->content,
            'rating' => $request->rating,
            'is_approved' => false,
        ]);

        // Handle regular image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('review-images', 'public');
                $review->images()->create([
                    'image_path' => $path,
                    'is_webcam' => false
                ]);
            }
        }

        // Handle webcam images (base64)
        if ($request->has('webcam_images')) {
            foreach ($request->webcam_images as $base64Image) {
                $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $base64Image));
                $fileName = 'webcam_' . time() . '_' . uniqid() . '.jpg';
                $path = 'review-images/' . $fileName;
            
                Storage::disk('public')->put($path, $imageData);
            
                $review->images()->create([
                    'image_path' => $path,
                    'is_webcam' => true
                ]);
            }
        }

        // Update reviewable rating
        $this->updateReviewableRating($request->reviewable_type, $request->reviewable_id);

        return response()->json([
            'message' => 'Review submitted successfully and is pending approval',
            'review' => $review->load(['user', 'images'])
        ], 201);
    }

    public function show($id)
    {
        $review = Review::with(['user', 'images', 'interactions.user'])
            ->findOrFail($id);

        return response()->json($review);
    }

    public function addInteraction(Request $request, $reviewId)
    {
        $request->validate([
            'type' => 'required|in:like,dislike,helpful',
            'content' => 'nullable|string|max:500'
        ]);

        $review = Review::findOrFail($reviewId);

        // Check if user already interacted with this review
        $existingInteraction = $review->interactions()
            ->where('user_id', Auth::id())
            ->where('type', $request->type)
            ->first();

        if ($existingInteraction) {
            return response()->json([
                'message' => 'You have already ' . $request->type . 'd this review'
            ], 409);
        }

        $interaction = $review->interactions()->create([
            'user_id' => Auth::id(),
            'type' => $request->type,
            'content' => $request->content
        ]);

        return response()->json([
            'message' => 'Interaction added successfully',
            'interaction' => $interaction->load('user')
        ]);
    }

    /**
     * Get reviews for a specific location
     */
    public function getLocationReviews(Request $request, $locationId)
    {
        $reviews = Review::with(['user', 'images', 'interactions'])
            ->where('reviewable_type', 'App\\Models\\Location')
            ->where('reviewable_id', $locationId)
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * Store a review for a location
     */
    public function storeLocationReview(Request $request, $locationId)
    {
        $location = Location::findOrFail($locationId);
        
        $request->merge([
            'reviewable_type' => 'App\\Models\\Location',
            'reviewable_id' => $locationId
        ]);

        return $this->store($request);
    }

    /**
     * Get review statistics
     */
    public function getStats(Request $request, $id)
{
    $reviewableType = $request->get('type', 'App\\Models\\Restaurant');

    $baseQuery = Review::where('reviewable_type', $reviewableType)
        ->where('reviewable_id', $id)
        ->where('is_approved', true);

    // Clone query để dùng nhiều nơi
    $reviews = $baseQuery->get();

    $stats = [
        'total_reviews' => $reviews->count(),
        'average_rating' => round($reviews->avg('rating'), 1),
        'rating_breakdown' => [
            5 => $reviews->where('rating', 5)->count(),
            4 => $reviews->where('rating', 4)->count(),
            3 => $reviews->where('rating', 3)->count(),
            2 => $reviews->where('rating', 2)->count(),
            1 => $reviews->where('rating', 1)->count(),
        ],
        'reviews' => $reviews,
    ];

    return response()->json([
        'success' => true,
        'data' => $stats,
    ]);
}


    /**
     * Update the average rating of the reviewable model
     */
    private function updateReviewableRating($reviewableType, $reviewableId)
    {
        $averageRating = Review::where('reviewable_type', $reviewableType)
            ->where('reviewable_id', $reviewableId)
            ->where('is_approved', true)
            ->avg('rating');

        if ($reviewableType === 'App\\Models\\Location') {
            Location::where('id', $reviewableId)->update(['rating' => $averageRating ?? 0]);
        } elseif ($reviewableType === 'App\\Models\\Restaurant') {
            Restaurant::where('id', $reviewableId)->update(['rating' => $averageRating ?? 0]);
        }
    }
}