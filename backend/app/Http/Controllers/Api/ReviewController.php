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
    public function index(Request $request)
    {
        $query = Review::with('user', 'images');

        if ($request->has('reviewable_type') && $request->has('reviewable_id')) {
            $query->where('reviewable_type', $request->reviewable_type)
                ->where('reviewable_id', $request->reviewable_id);
        }

        return response()->json($query->latest()->paginate(5));
    }

    public function getMyReviews(Request $request)
    {
        $query = Review::with('user', 'images')->where('user_id', Auth::id());

        if ($request->has('reviewable_type') && $request->has('reviewable_id')) {
            $query->where('reviewable_type', $request->reviewable_type)
                ->where('reviewable_id', $request->reviewable_id);
        }

        return response()->json($query->latest()->paginate(4));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'reviewable_type' => 'nullable|string',
            'reviewable_id' => 'nullable|integer',
            'content' => 'required|string|max:1000',
            'rating' => 'nullable|integer|min:1|max:5',
        ]);

        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn cần đăng nhập để gửi đánh giá.'
            ], 401);
        }

        $review = Review::create([
            'user_id' => Auth::id(),
            'reviewable_type' => $request->reviewable_type,
            'reviewable_id' => $request->reviewable_id,
            'content' => $request->content,
            'rating' => $request->rating,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đánh giá của bạn đã được gửi thành công và đang chờ duyệt!',
            'data' => $review
        ], 201);
    }

    public function show($id)
    {
        $review = Review::with(['user', 'images'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $review
        ]);
    }

    public function update(Request $request, $id)
    {
        $review = Review::where('id', $id)->where('user_id', Auth::id())->firstOrFail();

        $request->validate([
            'content' => 'required|string',
            'rating' => 'nullable|integer|min:1|max:5'
        ]);
        $review->update($request->only(['content', 'rating']));

        return response()->json([
            'message' => 'Review updated successfully.',
            'data' => $review,
        ]);
    }

    public function destroy($id)
    {
        $review = Review::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        $review->delete();

        return response()->json([
            'message' => 'Review deleted.',
        ]);
    }
}
