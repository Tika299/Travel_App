<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckinPlace;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Exception;

class CheckinPlaceController extends Controller
{
    // 🔍 Lấy danh sách tất cả địa điểm
public function index(): JsonResponse
{
    $places = CheckinPlace::with('linkedHotels.hotel')->get(); // ✅ thêm eager loading

    return response()->json([
        'success' => true,
        'data' => $places
    ], 200);
}



    // 👁️ Lấy chi tiết 1 địa điểm
    public function show($id): JsonResponse
    {
        $place = CheckinPlace::find($id);
        if (!$place) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy địa điểm'], 404);
        }
        return response()->json(['success' => true, 'data' => $place], 200);
    }

    // ➕ Tạo mới địa điểm
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateRequest($request);

            // Ảnh đại diện
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('uploads/checkin_places', 'public');
                $validated['image'] = '/storage/' . $imagePath;
            }

            // Danh sách ảnh phụ
            if ($request->hasFile('images')) {
                $imagePaths = [];
                foreach ($request->file('images') as $img) {
                    $path = $img->store('uploads/checkin_places', 'public');
                    $imagePaths[] = '/storage/' . $path;
                }
                $validated['images'] = json_encode($imagePaths);
            }

            // Mặc định các giá trị
            $validated['operating_hours'] = json_encode($validated['operating_hours'] ?? []);
            $validated['transport_options'] = json_encode($validated['transport_options'] ?? []);
            $validated['status'] = $validated['status'] ?? 'active';
            $validated['is_free'] = isset($validated['price']) && $validated['price'] == 0
                ? true
                : ($validated['is_free'] ?? false);

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

    // ✏️ Cập nhật địa điểm
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $place = CheckinPlace::find($id);
            if (!$place) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy địa điểm'], 404);
            }

            $validated = $this->validateRequest($request);

            // Ảnh đại diện
            if ($request->hasFile('image')) {
                if ($place->image && file_exists(public_path($place->image))) {
                    unlink(public_path($place->image));
                }
                $imagePath = $request->file('image')->store('uploads/checkin_places', 'public');
                $validated['image'] = '/storage/' . $imagePath;
            }

            // Danh sách ảnh phụ
            if ($request->hasFile('images')) {
                $imagePaths = [];
                foreach ($request->file('images') as $img) {
                    $path = $img->store('uploads/checkin_places', 'public');
                    $imagePaths[] = '/storage/' . $path;
                }
                $validated['images'] = json_encode($imagePaths);
            }

            // Mặc định các giá trị
            $validated['operating_hours'] = json_encode($validated['operating_hours'] ?? []);
            $validated['transport_options'] = json_encode($validated['transport_options'] ?? []);
            $validated['status'] = $validated['status'] ?? $place->status;
            $validated['is_free'] = isset($validated['price']) && $validated['price'] == 0
                ? true
                : ($validated['is_free'] ?? false);

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

    // ❌ Xoá địa điểm
    public function destroy($id): JsonResponse
    {
        try {
            $place = CheckinPlace::find($id);
            if (!$place) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy địa điểm'], 404);
            }

            if ($place->image && file_exists(public_path($place->image))) {
                unlink(public_path($place->image));
            }

            $place->delete();
            return response()->json(['success' => true, 'message' => 'Đã xoá địa điểm'], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xoá',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ Hàm validate dùng chung
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
            'checkin_count' => 'nullable|integer|min:0',
            'review_count' => 'nullable|integer|min:0',
            'images.*' => 'nullable|image|max:2048',
            'region' => 'nullable|string|max:100',
            'caption' => 'nullable|string|max:255',
            'distance' => 'nullable|string|max:100',
            'transport_options' => 'nullable|array',
            'status' => 'nullable|string|in:active,inactive,draft', // ✅ thêm dòng này
        ]);
    }
}
