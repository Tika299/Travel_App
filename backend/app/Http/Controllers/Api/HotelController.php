<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HotelController extends Controller
{
    // Lấy danh sách tất cả khách sạn (Read - Index)
    public function index(): JsonResponse
    {
        $hotels = Hotel::with(['rooms' => function ($query) {
            $query->orderBy('price_per_night', 'asc')->take(1);
        }])->get();
        return response()->json(['success' => true, 'data' => $hotels]);
    }

    // Lấy thông tin chi tiết của một khách sạn (Read - Show)
    public function show($id): JsonResponse
    {
        $hotel = Hotel::find($id);

        if (!$hotel) {
            return response()->json(['success' => false, 'message' => 'Khách sạn không tồn tại'], 404);
        }

        return response()->json(['success' => true, 'data' => $hotel]);
    }

    // Tạo mới khách sạn (Create)
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'rating' => 'required|numeric|min:0|max:5',
            'review_count' => 'required|integer|min:0',
            'phone' => 'required|string|max:15',
        ]);

        $hotel = Hotel::create($validatedData);

        return response()->json(['success' => true, 'data' => $hotel], 201);
    }

    // Cập nhật thông tin khách sạn (Update)
    public function update(Request $request, $id): JsonResponse
    {
        $hotel = Hotel::find($id);

        if (!$hotel) {
            return response()->json(['success' => false, 'message' => 'Khách sạn không tồn tại'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string',
            'rating' => 'sometimes|required|numeric|min:0|max:5',
            'review_count' => 'sometimes|required|integer|min:0',
            'phone' => 'sometimes|required|string|max:15',
        ]);

        $hotel->update($validatedData);

        return response()->json(['success' => true, 'data' => $hotel]);
    }

    // Xóa khách sạn (Delete)
    public function destroy($id): JsonResponse
    {
        $hotel = Hotel::find($id);

        if (!$hotel) {
            return response()->json(['success' => false, 'message' => 'Khách sạn không tồn tại'], 404);
        }

        $hotel->delete();

        return response()->json(['success' => true, 'message' => 'Khách sạn đã được xóa']);
    }

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
            $query->orderBy('price_per_night', 'asc')->take(1);
        }])
            ->orderByDesc('rating')
            ->orderByDesc('review_count')
            ->limit(4)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $hotels,
        ]);
    }
}
