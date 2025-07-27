<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\HotelRoom;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\AmenityResource;
use Illuminate\Support\Facades\Log;

class HotelRoomController extends Controller
{
    /**
     * Lấy danh sách tiện ích của phòng khách sạn
     *
     * @param int $roomId
     * @return JsonResponse
     */
    // Lấy thông tin chi tiết của một khách sạn và tất cả phòng của nó (Read - Show)
    public function getAllRoomAmenities($roomId): JsonResponse
    {
        $room = HotelRoom::with('amenityList')->find($roomId);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Phòng không tồn tại'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => \App\Http\Resources\AmenityResource::collection($room->amenityList),
        ]);
    }
}
