<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    /**
     * Store a newly created review in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // 1. Validate the incoming request data
        $request->validate([
            'reviewable_type' => 'required|string', // e.g., 'App\\Models\\TransportCompany' or 'App\\Models\\CheckinPlace'
            'reviewable_id' => 'required|integer',
            'content' => 'required|string|max:1000',
            'rating' => 'required|numeric|min:1|max:5',
            'images' => 'array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'guest_name' => 'nullable|string|max:255', // Thêm validation cho guest_name
        ]);

        // ✅ Lấy user_id nếu có người dùng đăng nhập, nếu không thì để null
        $userId = Auth::check() ? Auth::id() : null;
        // ✅ BỎ ĐOẠN CHECK AUTH::CHECK() NÀY ĐỂ CHO PHÉP KHÔNG ĐĂNG NHẬP GỬI REVIEW
        // if (!Auth::check()) {
        //     return response()->json(['message' => 'Bạn cần đăng nhập để gửi đánh giá.'], 401);
        // }

        // Optional: Prevent multiple reviews from the same logged-in user for the same item
        // Kiểm tra này chỉ áp dụng nếu có user_id (người dùng đã đăng nhập)
        if ($userId) {
            $existingReview = Review::where('user_id', $userId)
                                    ->where('reviewable_type', $request->reviewable_type)
                                    ->where('reviewable_id', $request->reviewable_id)
                                    ->first();

            if ($existingReview) {
                return response()->json(['message' => 'Bạn đã đánh giá địa điểm này rồi.'], 409);
            }
        }

        // 4. Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('reviews', 'public'); // Store in 'storage/app/public/reviews'
                $imagePaths[] = $path;
            }
        }

        // 5. Create the new review
        $review = Review::create([
            'user_id' => $userId, // Gán ID người dùng nếu có, nếu không thì null
            'reviewable_type' => $request->reviewable_type,
            'reviewable_id' => $request->reviewable_id,
            'content' => $request->content,
            'rating' => $request->rating,
            'images' => !empty($imagePaths) ? json_encode($imagePaths) : null,
            'is_approved' => false, // Set to false if reviews need manual approval
            'guest_name' => $request->input('guest_name'), // Lấy tên khách từ request
        ]);

        // 6. Return a success response
        return response()->json([
            'success' => true,
            'message' => 'Đánh giá của bạn đã được gửi thành công và đang chờ duyệt!',
            'data' => $review
        ], 201);
    }

    /**
     * Get suggested reviews for display.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSuggested(): JsonResponse
    {
        $reviews = Review::with(['user', 'reviewable'])
                         ->where('is_approved', true)
                         ->latest()
                         ->limit(6)
                         ->get();

        return response()->json([
            'success'   => true,
            'data'      => $reviews,
        ]);
    }
}