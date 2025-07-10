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
    public function getPopularHotels(): \Illuminate\Http\JsonResponse
    {
        $hotels = \App\Models\Hotel::orderByDesc('rating')
            ->orderByDesc('review_count')
            ->limit(4)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $hotels,
        ]);
    }
}
