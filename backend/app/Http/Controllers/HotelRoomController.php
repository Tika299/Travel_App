<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\HotelRoom;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\AmenityResource;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class HotelRoomController extends Controller
{
    /**
     * Đồng bộ hóa (thêm/xóa) các tiện ích cho một phòng khách sạn.
     *
     * @param Request $request
     * @param int $roomId
     * @return JsonResponse
     */
    public function syncAmenities(Request $request, $roomId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amenity_ids' => 'required|array',
            'amenity_ids.*' => 'integer|exists:amenities,id' // Đảm bảo mỗi id đều tồn tại
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $room = HotelRoom::find($roomId);
            if (!$room) {
                return response()->json(['success' => false, 'message' => 'Phòng không tồn tại'], 404);
            }

            // Thay amenities() bằng amenityList() để khớp với model của bạn
            $room->amenityList()->sync($request->input('amenity_ids'));

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật tiện ích cho phòng thành công'
            ]);
        } catch (\Exception $e) {
            Log::error("Error syncing amenities for room $roomId: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server'
            ], 500);
        }
    }
    // Lấy tất cả tiện ích của một phòng khách sạn
    // Sử dụng mối quan hệ đã định nghĩa trong model HotelRoom
    /**
     * Lấy tất cả tiện ích của một phòng khách sạn
     * @param int $roomId
     * @return JsonResponse
     */
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
            'data'    => AmenityResource::collection($room->amenityList),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // 1. Cập nhật validation để chấp nhận một MẢNG ảnh
        $validator = Validator::make($request->all(), [
            'hotel_id' => 'required|exists:hotels,id',
            'room_type' => 'required|string|max:255',
            'price_per_night' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'room_area' => 'nullable|numeric|min:0',
            'bed_type' => 'nullable|string|max:255',
            'max_occupancy' => 'nullable|integer|min:1',
            'images' => 'nullable|array', // Phải là một mảng
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Kiểm tra từng file trong mảng
            'amenity_ids' => 'nullable|json',
            // ... các rule khác
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $request->except(['images', 'amenity_ids']);

            // 2. "Biến tấu" logic xử lý file để lặp qua nhiều ảnh
            if ($request->hasFile('images')) {
                $imagePaths = []; // Khởi tạo một mảng rỗng để chứa các đường dẫn

                foreach ($request->file('images') as $imageFile) {
                    // Tạo tên file duy nhất cho mỗi ảnh
                    $imageName = time() . '_' . uniqid() . '.' . $imageFile->getClientOriginalExtension();

                    // Di chuyển từng file vào thư mục public
                    $imageFile->move(public_path('storage/uploads/hotel_rooms'), $imageName);

                    // Thêm đường dẫn của file vừa xử lý vào mảng
                    $imagePaths[] = 'storage/uploads/hotel_rooms/' . $imageName;
                }

                // 3. Gán mảng các đường dẫn vào dữ liệu.
                // Do đã có $casts trong Model, Laravel sẽ tự động mã hóa mảng này thành JSON.
                $data['images'] = $imagePaths;
            }

            // Tạo phòng với dữ liệu đã chuẩn bị
            $room = HotelRoom::create($data);

            // Xử lý tiện ích (giữ nguyên)
            if ($request->has('amenity_ids')) {
                $amenityIds = json_decode($request->input('amenity_ids'), true);
                if (is_array($amenityIds) && !empty($amenityIds)) {
                    $room->amenityList()->sync($amenityIds);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Tạo phòng với nhiều ảnh thành công!',
                'data' => $room->load('amenityList'),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Lỗi tạo phòng: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server',
            ], 500);
        }
    }
}
