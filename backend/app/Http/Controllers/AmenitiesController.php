<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HotelRoom;
use Illuminate\Support\Facades\Log;

class AmenitiesController extends Controller
{
    /**
     * Lấy danh sách tiện ích theo ID phòng từ bảng Amenity
     *
     * @param int $roomId
     * @return JsonResponse
     */
    public function getByRoom($roomId)
    {
        try {
            // Lấy phòng với mối quan hệ amenities
            $room = HotelRoom::with('amenities')->find($roomId);

            if (!$room) {
                Log::warning("Room not found: $roomId");
                return response()->json([
                    'success' => false,
                    'message' => 'Phòng không tồn tại'
                ], 404);
            }

            // Kiểm tra xem mối quan hệ amenities có được tải không
            if (!$room->relationLoaded('amenities')) {
                Log::warning("Amenities relationship not loaded for room: $roomId");
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể tải danh sách tiện ích'
                ], 500);
            }
            Log::info($room->amenities);
            // Ánh xạ dữ liệu tiện ích, lấy tất cả các cột từ bảng Amenity
            $amenities = $room->amenities->map(function ($amenity) {
                Log::info($amenity);
                return [
                    'id' => $amenity->id,
                    'name' => $amenity->name,
                    'icon' => $amenity->icon ?? null,
                    'react_icon' => $amenity->react_icon ?? null,
                ];
            })->toArray();

            // Ghi log thông tin tiện ích
            Log::info("Fetched amenities for room $roomId: ", ['amenities' => $amenities]);

            // Nếu không có tiện ích, trả về mảng rỗng
            if (empty($amenities)) {
                Log::info("No amenities found for room: $roomId");
            }

            return response()->json([
                'success' => true,
                'data' => $amenities
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error fetching amenities for room $roomId: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
