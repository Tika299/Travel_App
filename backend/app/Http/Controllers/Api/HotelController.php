<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;

class HotelController extends Controller
{
    // Lấy danh sách khách sạn đề xuất
    public function getSuggested(): JsonResponse
    {
        $hotels = Hotel::limit(6)->get();

        return response()->json(['success' => true, 'data' => $hotels]);
    }

    // Lấy danh sách khách sạn phổ biến
    public function getPopularHotels(): JsonResponse
    {
        $hotels = Hotel::with(['rooms' => function ($query) {
            // Lấy một phòng (ví dụ: phòng đầu tiên hoặc phòng rẻ nhất)
            $query->orderBy('price_per_night', 'asc')->take(1);
        }])
            ->orderByDesc('rating')
            // ->orderByDesc('review_count')
            ->limit(4)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $hotels,
        ]);
    }
}
