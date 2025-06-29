<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckinPlace;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Exception;
use App\Models\CheckinPhoto;
use App\Models\Review; // Đảm bảo đã import Review model

class CheckinPlaceController extends Controller
{
    /**
     * Lấy danh sách tất cả địa điểm check-in.
     */
    public function index(): JsonResponse
    {
        // ✅ Thêm eager loading cho checkinPhotos và linkedHotels
        $places = CheckinPlace::with('linkedHotels.hotel', 'checkinPhotos')->get();

        return response()->json([
            'success' => true,
            'data' => $places
        ], 200);
    }

    /**
     * Xử lý việc gửi ảnh check-in từ người dùng.
     * (giữ nguyên, không thay đổi)
     */
    public function submitCheckin(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'checkin_place_id' => 'required|exists:checkin_places,id',
                'image' => 'required|image|max:5120',
            ]);

            $imagePath = $request->file('image')->store('uploads/checkin_user_photos', 'public');

            CheckinPhoto::create([
                'checkin_place_id' => $request->checkin_place_id,
                'image' => $imagePath,
            ]);

            $place = CheckinPlace::find($request->checkin_place_id);
            if ($place) {
                $place->increment('checkin_count');
                $place->increment('review_count');
            }

            return response()->json([
                'success' => true,
                'message' => 'Check-in thành công!',
                'image_url' => Storage::url($imagePath),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi check-in.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xử lý việc check-in của người dùng vào một địa điểm.
     * (giữ nguyên, không thay đổi)
     */
    public function checkin(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'checkin_place_id' => 'required|exists:checkin_places,id',
                'image' => 'required|image|max:5120'
            ]);

            $place = CheckinPlace::findOrFail($request->checkin_place_id);

            $imagePath = $request->file('image')->store('uploads/checkin_user_photos', 'public');

            $place->checkinPhotos()->create([
                'image' => $imagePath,
            ]);

            $place->increment('checkin_count');
            $place->increment('review_count');
            
            return response()->json([
                'success' => true,
                'message' => 'Check-in thành công!',
                'image_url' => Storage::url($imagePath),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi check-in.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lấy thông tin chi tiết của một địa điểm check-in cụ thể.
     * Hàm này KHÔNG eager load 'reviews' vì reviews sẽ được lấy từ API riêng.
     */
    public function show($id): JsonResponse
    {
        // Vẫn eager load checkinPhotos và linkedHotels cho trang chi tiết
        $place = CheckinPlace::with('checkinPhotos', 'linkedHotels.hotel')->find($id);

        if (!$place) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy địa điểm'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $place
        ]);
    }

    /**
     * ✅ PHƯƠNG THỨC MỚI: Lấy tất cả đánh giá của một địa điểm check-in cụ thể.
     *
     * @param  int  $id ID của địa điểm check-in (CheckinPlace)
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPlaceReviews($id): JsonResponse
    {
        try {
            $place = CheckinPlace::find($id);

            if (!$place) {
                return response()->json([
                    'success' => false,
                    'message' => 'Địa điểm check-in không tồn tại.',
                    'data' => []
                ], 404);
            }

            // Tải các reviews liên quan đến địa điểm này
            // Bao gồm thông tin user và reviewable (chính là địa điểm đó)
            // Lọc các reviews đã được phê duyệt và sắp xếp mới nhất
            $reviews = $place->reviews()
                             ->with(['user', 'reviewable']) // Rất quan trọng để tải user và reviewable
                             ->where('is_approved', true)   // Chỉ lấy reviews đã duyệt
                             ->latest()                     // Sắp xếp mới nhất lên đầu
                             ->get();

            return response()->json([
                'success' => true,
                'message' => 'Lấy đánh giá địa điểm thành công.',
                'data' => $reviews
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi lấy đánh giá địa điểm: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }


    /**
     * Tạo mới một địa điểm check-in.
     * (giữ nguyên, không thay đổi)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateRequest($request);

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('uploads/checkin', 'public');
                $validated['image'] = $imagePath;
            } else {
                $validated['image'] = null;
            }

            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $img) {
                    $path = $img->store('uploads/checkin', 'public');
                    $imagePaths[] = $path;
                }
            }
            $validated['images'] = $imagePaths;

            $validated['operating_hours'] = $validated['operating_hours'] ?? ['open' => '', 'close' => ''];
            $validated['transport_options'] = $validated['transport_options'] ?? [];
            $validated['status'] = $validated['status'] ?? 'active';

            $validated['is_free'] = (bool)($validated['is_free'] ?? false);
            if (isset($validated['price']) && $validated['price'] == 0) {
                $validated['is_free'] = true;
            }
            if ($validated['is_free']) {
                $validated['price'] = null;
            }
            $validated['latitude'] = $validated['latitude'] === '' ? null : (float) $validated['latitude'];
            $validated['longitude'] = $validated['longitude'] === '' ? null : (float) $validated['longitude'];
            $validated['rating'] = $validated['rating'] === '' ? null : (float) $validated['rating'];
            $validated['price'] = $validated['price'] === '' ? null : (float) $validated['price'];
            $validated['checkin_count'] = $validated['checkin_count'] === '' ? 0 : (int) $validated['checkin_count'];
            $validated['review_count'] = $validated['review_count'] === '' ? 0 : (int) $validated['review_count'];

            $place = CheckinPlace::create($validated);

            return response()->json(['success' => true, 'data' => $place], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo địa điểm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật thông tin của một địa điểm check-in.
     * (giữ nguyên, không thay đổi)
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $place = CheckinPlace::find($id);
            if (!$place) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy địa điểm'], 404);
            }

            $validated = $this->validateRequest($request);

            if ($request->hasFile('image')) {
                if ($place->image && Storage::disk('public')->exists($place->image)) {
                    Storage::disk('public')->delete($place->image);
                }
                $imagePath = $request->file('image')->store('uploads/checkin', 'public');
                $validated['image'] = $imagePath;
            }

            $oldImagesFromRequest = $request->input('old_images', []);
            $currentImages = [];

            foreach ($oldImagesFromRequest as $img) {
                $currentImages[] = str_replace('/storage/', '', $img);
            }

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $img) {
                    $path = $img->store('uploads/checkin', 'public');
                    $currentImages[] = $path;
                }
            }

            $imagesInDb = $place->images ?? [];
            if (!is_array($imagesInDb)) {
                $imagesInDb = json_decode($imagesInDb, true) ?? [];
            }

            foreach ($imagesInDb as $dbImage) {
                if (!in_array($dbImage, $currentImages) && Storage::disk('public')->exists($dbImage)) {
                    Storage::disk('public')->delete($dbImage);
                }
            }
            $validated['images'] = $currentImages;

            $validated['operating_hours'] = $validated['operating_hours'] ?? ['open' => '', 'close' => ''];
            $validated['transport_options'] = $validated['transport_options'] ?? [];
            $validated['status'] = $validated['status'] ?? $place->status;

            $validated['is_free'] = (bool)($validated['is_free'] ?? false);
            if (isset($validated['price']) && $validated['price'] == 0) {
                $validated['is_free'] = true;
            }
            if ($validated['is_free']) {
                $validated['price'] = null;
            }
            $validated['latitude'] = $validated['latitude'] === '' ? null : (float) $validated['latitude'];
            $validated['longitude'] = $validated['longitude'] === '' ? null : (float) $validated['longitude'];
            $validated['rating'] = $validated['rating'] === '' ? null : (float) $validated['rating'];
            $validated['price'] = $validated['price'] === '' ? null : (float) $validated['price'];
            $validated['checkin_count'] = $validated['checkin_count'] === '' ? 0 : (int) $validated['checkin_count'];
            $validated['review_count'] = $validated['review_count'] === '' ? 0 : (int) $validated['review_count'];

            $place->update($validated);

            return response()->json(['success' => true, 'data' => $place], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa một địa điểm check-in và tất cả các ảnh liên quan.
     * (giữ nguyên, không thay đổi)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $place = CheckinPlace::find($id);
            if (!$place) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy địa điểm'], 404);
            }

            if ($place->image && Storage::disk('public')->exists($place->image)) {
                Storage::disk('public')->delete($place->image);
            }

            $auxiliaryImages = $place->images ?? [];
            if (!is_array($auxiliaryImages)) {
                $auxiliaryImages = json_decode($auxiliaryImages, true) ?? [];
            }
            if (is_array($auxiliaryImages)) {
                foreach ($auxiliaryImages as $imagePath) {
                    if (Storage::disk('public')->exists($imagePath)) {
                        Storage::disk('public')->delete($imagePath);
                    }
                }
            }

            foreach ($place->checkinPhotos as $photo) {
                if ($photo->image && Storage::disk('public')->exists($photo->image)) {
                    Storage::disk('public')->delete($photo->image);
                }
                $photo->delete();
            }

            $place->delete();
            return response()->json(['success' => true, 'message' => 'Đã xoá địa điểm và tất cả ảnh liên quan'], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xoá',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa một ảnh check-in cụ thể.
     * (giữ nguyên, không thay đổi)
     */
    public function deleteCheckinPhoto($photoId): JsonResponse
    {
        try {
            $checkinPhoto = CheckinPhoto::find($photoId);

            if (!$checkinPhoto) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy ảnh check-in'], 404);
            }

            if ($checkinPhoto->image && Storage::disk('public')->exists($checkinPhoto->image)) {
                Storage::disk('public')->delete($checkinPhoto->image);
            }

            $checkinPhoto->delete();

            return response()->json(['success' => true, 'message' => 'Đã xóa ảnh check-in thành công.'], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa ảnh check-in.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hàm dùng chung để validate request.
     * (giữ nguyên, không thay đổi)
     */
    private function validateRequest(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'image' => 'nullable|image|max:2048',
            'rating' => 'nullable|numeric|min:0|max:5',
            'location_id' => 'nullable|integer|exists:locations,id',
            'price' => 'nullable|numeric|min:0',
            'is_free' => 'nullable|boolean',
            'operating_hours' => 'nullable|array',
            'operating_hours.open' => 'nullable|date_format:H:i',
            'operating_hours.close' => 'nullable|date_format:H:i|after:operating_hours.open',
            'checkin_count' => 'nullable|integer|min:0',
            'review_count' => 'nullable|integer|min:0',
            'images' => 'nullable|array',
            'images.*' => 'image|max:2048',
            'old_images' => 'nullable|array',
            'old_images.*' => 'nullable|string',
            'region' => 'nullable|string|max:100',
            'caption' => 'nullable|string|max:255',
            'distance' => 'nullable|string|max:100',
            'transport_options' => 'nullable|array',
            'transport_options.*' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive,draft',
        ]);
    }

    public function getStatistics()
    {
        try {
            $totalCheckinPlaces = CheckinPlace::count();
            $totalReviews = Review::count();
            $totalCheckins = CheckinPhoto::count(); // Hoặc Checkin::count() nếu bạn có model Checkin riêng
            $activeCheckinPlaces = CheckinPlace::where('status', 'active')->count();

            return response()->json([
                'success' => true,
                'message' => 'Thống kê địa điểm check-in đã được lấy thành công.',
                'data' => [
                    'totalCheckinPlaces' => $totalCheckinPlaces,
                    'totalReviews' => $totalReviews,
                    'totalCheckins' => $totalCheckins,
                    'activeCheckinPlaces' => $activeCheckinPlaces,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy số liệu thống kê: ' . $e->getMessage()
            ], 500);
        }
    }
}