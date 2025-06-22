<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckinPlace;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Exception;
use App\Models\CheckinPhoto; // Đảm bảo đã import CheckinPhoto model

class CheckinPlaceController extends Controller
{
    // 🔍 Lấy danh sách tất cả địa điểm
    public function index(): JsonResponse
    {
        // ✅ Thêm eager loading cho checkinPhotos để trả về đầy đủ dữ liệu khi liệt kê
        $places = CheckinPlace::with('linkedHotels.hotel', 'checkinPhotos')->get();

        return response()->json([
            'success' => true,
            'data' => $places
        ], 200);
    }

    /**
     * @deprecated Sử dụng phương thức `checkin` thay thế
     */
    public function submitCheckin(Request $request): JsonResponse
    {
        // Phương thức này có vẻ trùng lặp với `checkin`. Nên cân nhắc chỉ giữ lại một.
        // Tôi sẽ giữ nguyên logic nhưng khuyến nghị sử dụng `checkin`.
        try {
            $request->validate([
                'checkin_place_id' => 'required|exists:checkin_places,id',
                'image' => 'required|image|max:5120',
            ]);

            // Lưu ảnh vào storage
            // Laravel 9+ tốt hơn nên dùng Storage::putFile hoặc Storage::putFileAs
            $imagePath = $request->file('image')->store('uploads/checkin_user_photos', 'public');

            // Ghi vào bảng checkin_photos
            // Lưu ý: '/storage/' là prefix cần thiết cho URL công khai,
            // nhưng trong DB chỉ nên lưu đường dẫn tương đối từ storage/app/public
            CheckinPhoto::create([
                'checkin_place_id' => $request->checkin_place_id,
                'image' => $imagePath, // Lưu đường dẫn tương đối
                // 'user_id' => auth()->id(), // Nếu có authentication, nên lưu user_id
            ]);

            // Cập nhật lượt checkin và review
            $place = CheckinPlace::find($request->checkin_place_id);
            if ($place) { // Kiểm tra null
                $place->increment('checkin_count');
                $place->increment('review_count');
            }

            return response()->json([
                'success' => true,
                'message' => 'Check-in thành công!',
                'image_url' => Storage::url($imagePath), // Trả về URL công khai
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

    public function checkin(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'checkin_place_id' => 'required|exists:checkin_places,id',
                'image' => 'required|image|max:5120'
            ]);

            $place = CheckinPlace::findOrFail($request->checkin_place_id);

            // Lưu ảnh
            $imagePath = $request->file('image')->store('uploads/checkin_user_photos', 'public');

            // Ghi DB (sử dụng quan hệ)
            $place->checkinPhotos()->create([
                'image' => $imagePath, // Lưu đường dẫn tương đối
                // 'user_id' => auth()->id(), // Nếu có authentication, nên lưu user_id
            ]);

            // Cập nhật số lượt
            $place->increment('checkin_count');
            $place->increment('review_count');

            return response()->json([
                'success' => true,
                'message' => 'Check-in thành công!',
                'image_url' => Storage::url($imagePath), // Trả về URL công khai
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

    public function show($id): JsonResponse
    {
        // ⚠️ Đảm bảo quan hệ eager loaded 'checkinPhotos'
        $place = CheckinPlace::with('checkinPhotos')->find($id);

        if (!$place) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy địa điểm'], 404);
        }

        // Nếu 'images' hoặc 'operating_hours' hay 'transport_options' được lưu dưới dạng JSON string,
        // chúng ta cần decode chúng trước khi gửi đi, nếu không Laravel tự động cast
        // đã được cấu hình trong model.
        // Tuy nhiên, để đảm bảo consistency, có thể thêm logic này nếu cần thiết:
        // if ($place->images && is_string($place->images)) {
        //      $place->images = json_decode($place->images);
        // }
        // if ($place->operating_hours && is_string($place->operating_hours)) {
        //      $place->operating_hours = json_decode($place->operating_hours, true);
        // }
        // if ($place->transport_options && is_string($place->transport_options)) {
        //      $place->transport_options = json_decode($place->transport_options);
        // }

        return response()->json([
            'success' => true,
            'data' => $place
        ]);
    }

    // ➕ Tạo mới địa điểm
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateRequest($request);

            // Ảnh đại diện
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('uploads/checkin', 'public');
                $validated['image'] = $imagePath; // Lưu đường dẫn tương đối
            } else {
                $validated['image'] = null; // Đảm bảo không có ảnh thì là null
            }

            // Danh sách ảnh phụ
            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $img) {
                    $path = $img->store('uploads/checkin', 'public');
                    $imagePaths[] = $path; // Lưu đường dẫn tương đối
                }
            }
            // Không cần json_encode ở đây nếu bạn có $casts = ['images' => 'array'] trong model.
            // Laravel sẽ tự động xử lý.
            $validated['images'] = $imagePaths;


            // Mặc định các giá trị và JSON encode (chỉ encode nếu không có casting)
            // Nếu bạn đã có $casts = ['operating_hours' => 'array', 'transport_options' => 'array']
            // thì không cần json_encode ở đây.
            $validated['operating_hours'] = $validated['operating_hours'] ?? ['open' => '', 'close' => ''];
            $validated['transport_options'] = $validated['transport_options'] ?? [];
            $validated['status'] = $validated['status'] ?? 'active';

            // Xử lý is_free dựa trên price hoặc giá trị is_free gửi lên
            $validated['is_free'] = (bool)($validated['is_free'] ?? false);
            if (isset($validated['price']) && $validated['price'] == 0) {
                 $validated['is_free'] = true;
            }
            // Nếu is_free là true, đặt price về null
            if ($validated['is_free']) {
                $validated['price'] = null;
            }
            // Ensure numeric fields are cast correctly if they come as empty strings
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

    // ✏️ Cập nhật địa điểm
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $place = CheckinPlace::find($id);
            if (!$place) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy địa điểm'], 404);
            }

            $validated = $this->validateRequest($request);

            // ✅ Xử lý ảnh đại diện mới
            if ($request->hasFile('image')) {
                // Xóa ảnh cũ nếu tồn tại
                if ($place->image && Storage::disk('public')->exists($place->image)) {
                    Storage::disk('public')->delete($place->image);
                }
                $imagePath = $request->file('image')->store('uploads/checkin', 'public');
                $validated['image'] = $imagePath; // Lưu đường dẫn tương đối
            } else {
                // Nếu không có ảnh mới được upload, và không có 'image' trong request,
                // thì giữ ảnh cũ của $place.
                // Nếu frontend gửi 'image' là null để xóa ảnh, bạn có thể xử lý tại đây:
                // if ($request->has('image') && $request->input('image') === null) {
                //     if ($place->image && Storage::disk('public')->exists($place->image)) {
                //         Storage::disk('public')->delete($place->image);
                //     }
                //     $validated['image'] = null;
                // }
            }

            // ✅ Xử lý ảnh phụ
            // Lấy danh sách ảnh cũ (đường dẫn tương đối) từ request
            $oldImagesFromRequest = $request->input('old_images', []);
            $currentImages = [];

            // Loại bỏ prefix /storage/ nếu có từ frontend gửi lên
            foreach ($oldImagesFromRequest as $img) {
                $currentImages[] = str_replace('/storage/', '', $img);
            }

            // Thêm ảnh mới được upload
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $img) {
                    $path = $img->store('uploads/checkin', 'public');
                    $currentImages[] = $path; // Lưu đường dẫn tương đối
                }
            }

            // Xóa ảnh cũ không còn trong danh sách old_images từ request
            // Lấy danh sách ảnh phụ hiện có trong DB của địa điểm này
            // ✅ Sửa lỗi ở đây: KHÔNG json_decode nếu đã là array do casting
            $imagesInDb = $place->images ?? []; // Lấy trực tiếp, Laravel đã cast nếu có $casts
            // Fallback nếu vì lý do nào đó mà $place->images không phải là array sau khi casting
            if (!is_array($imagesInDb)) {
                $imagesInDb = json_decode($imagesInDb, true) ?? [];
            }

            foreach ($imagesInDb as $dbImage) {
                // Chỉ xóa nếu ảnh thực sự không còn trong danh sách $currentImages
                // và file tồn tại trên storage
                if (!in_array($dbImage, $currentImages) && Storage::disk('public')->exists($dbImage)) {
                    Storage::disk('public')->delete($dbImage);
                }
            }
            // Không cần json_encode ở đây nếu bạn có $casts = ['images' => 'array'] trong model.
            // Laravel sẽ tự động xử lý.
            $validated['images'] = $currentImages; // Lưu mảng vào đây


            // ✅ Các trường đặc biệt dạng JSON
            // Đảm bảo dữ liệu gửi lên cho operating_hours và transport_options là array trước khi lưu
            // Nếu bạn đã có $casts trong model, Laravel sẽ tự động encode/decode.
            // Chỉ cần đảm bảo $validated['operating_hours'] và $validated['transport_options'] là mảng.
            $validated['operating_hours'] = $validated['operating_hours'] ?? ['open' => '', 'close' => ''];
            $validated['transport_options'] = $validated['transport_options'] ?? [];
            $validated['status'] = $validated['status'] ?? $place->status;

            // Xử lý is_free và price
            $validated['is_free'] = (bool)($validated['is_free'] ?? false);
            if (isset($validated['price']) && $validated['price'] == 0) {
                 $validated['is_free'] = true;
            }
            if ($validated['is_free']) {
                $validated['price'] = null; // Đặt giá về null nếu miễn phí
            }
            // Ensure numeric fields are cast correctly if they come as empty strings
            $validated['latitude'] = $validated['latitude'] === '' ? null : (float) $validated['latitude'];
            $validated['longitude'] = $validated['longitude'] === '' ? null : (float) $validated['longitude'];
            $validated['rating'] = $validated['rating'] === '' ? null : (float) $validated['rating'];
            $validated['price'] = $validated['price'] === '' ? null : (float) $validated['price'];
            $validated['checkin_count'] = $validated['checkin_count'] === '' ? 0 : (int) $validated['checkin_count'];
            $validated['review_count'] = $validated['review_count'] === '' ? 0 : (int) $validated['review_count'];


            // ✅ Cập nhật
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

            // Xóa ảnh đại diện
            if ($place->image && Storage::disk('public')->exists($place->image)) {
                Storage::disk('public')->delete($place->image);
            }

            // Xóa tất cả ảnh phụ liên quan
            // ✅ Sửa lỗi ở đây: Không json_decode nếu đã là array do casting
            $auxiliaryImages = $place->images ?? [];
            if (!is_array($auxiliaryImages)) { // Fallback
                $auxiliaryImages = json_decode($auxiliaryImages, true) ?? [];
            }
            if (is_array($auxiliaryImages)) { // Vẫn kiểm tra để chắc chắn là mảng
                foreach ($auxiliaryImages as $imagePath) {
                    if (Storage::disk('public')->exists($imagePath)) {
                        Storage::disk('public')->delete($imagePath);
                    }
                }
            }

            // Xóa tất cả ảnh check-in của người dùng liên quan
            // Đảm bảo quan hệ checkinPhotos đã được định nghĩa trong CheckinPlace model
            foreach ($place->checkinPhotos as $photo) {
                if ($photo->image && Storage::disk('public')->exists($photo->image)) {
                    Storage::disk('public')->delete($photo->image);
                }
                $photo->delete(); // Xóa bản ghi trong DB
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
     * ✅ Phương thức mới để xóa một ảnh check-in cụ thể.
     * Đây là phần bạn cần thêm để giải quyết lỗi 404.
     */
    public function deleteCheckinPhoto($photoId): JsonResponse
    {
        try {
            $checkinPhoto = CheckinPhoto::find($photoId);

            if (!$checkinPhoto) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy ảnh check-in'], 404);
            }

            // Xóa file ảnh khỏi storage
            if ($checkinPhoto->image && Storage::disk('public')->exists($checkinPhoto->image)) {
                Storage::disk('public')->delete($checkinPhoto->image);
            }

            // Xóa bản ghi trong database
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


    // ✅ Hàm validate dùng chung
    private function validateRequest(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'image' => 'nullable|image|max:2048', // Ảnh bìa chính
            'rating' => 'nullable|numeric|min:0|max:5',
            'location_id' => 'nullable|integer|exists:locations,id', // Đảm bảo bảng 'locations' tồn tại
            'price' => 'nullable|numeric|min:0',
            'is_free' => 'nullable|boolean',
            'operating_hours' => 'nullable|array',
            'operating_hours.open' => 'nullable|date_format:H:i', // Validate định dạng giờ
            'operating_hours.close' => 'nullable|date_format:H:i|after:operating_hours.open', // Validate định dạng và giờ đóng sau giờ mở
            'checkin_count' => 'nullable|integer|min:0',
            'review_count' => 'nullable|integer|min:0',
            'images' => 'nullable|array', // Mảng các ảnh phụ mới
            'images.*' => 'image|max:2048', // Mỗi ảnh trong mảng
            'old_images' => 'nullable|array', // Mảng các đường dẫn ảnh cũ từ frontend
            'old_images.*' => 'nullable|string', // Mỗi đường dẫn ảnh cũ
            'region' => 'nullable|string|max:100',
            'caption' => 'nullable|string|max:255',
            'distance' => 'nullable|string|max:100', // Nếu distance là số, nên đổi thành numeric
            'transport_options' => 'nullable|array',
            'transport_options.*' => 'nullable|string|max:255', // Mỗi tùy chọn phương tiện
            'status' => 'nullable|string|in:active,inactive,draft',
        ]);
    }
}