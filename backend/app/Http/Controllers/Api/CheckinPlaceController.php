<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckinPlace;
use App\Models\CheckinPhoto; // Giữ lại nếu bạn có thể cần trong tương lai, hoặc xóa nếu không dùng.
use App\Models\Review;      // Giữ lại nếu bạn có thể cần trong tương lai, hoặc xóa nếu không dùng.
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Exception;
use Illuminate\Support\Facades\Log; // Import lớp Log

class CheckinPlaceController extends Controller
{
    /**
     * Lấy danh sách tất cả các địa điểm check-in.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            // Tải các địa điểm check-in cùng với thông tin khách sạn liên kết và reviews
            $places = CheckinPlace::with(['linkedHotels.hotel', 'reviews'])->get();

            if ($places->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Không có địa điểm check-in nào được tìm thấy.',
                    'data'    => [],
                ], 200); // Trả về 200 OK nhưng với dữ liệu rỗng và thông báo.
            }

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách địa điểm check-in và reviews thành công.',
                'data'    => $places,
            ]);
        } catch (Exception $e) {
            // Ghi log lỗi chi tiết để dễ dàng gỡ lỗi
            Log::error('Lỗi khi lấy danh sách địa điểm check-in: ' . $e->getMessage());
            Log::error($e->getTraceAsString()); // Ghi đầy đủ stack trace vào log

            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi tải danh sách địa điểm. Vui lòng thử lại sau.',
                'error'   => env('APP_DEBUG') ? $e->getMessage() : 'Lỗi nội bộ máy chủ.',
            ], 500);
        }
    }

    /**
     * Hiển thị thông tin chi tiết của một địa điểm check-in cụ thể.
     *
     * @param int $id ID của địa điểm check-in.
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            // Tìm địa điểm check-in theo ID và tải thông tin khách sạn liên kết
            $place = CheckinPlace::with('linkedHotels.hotel')->find($id);

            if (! $place) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy địa điểm check-in với ID đã cung cấp.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Lấy thông tin địa điểm check-in thành công.', // Thêm thông báo thành công
                'data'    => $place,
            ]);
        } catch (Exception $e) {
            Log::error('Lỗi khi lấy chi tiết địa điểm check-in ID: ' . $id . ' - ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi tải chi tiết địa điểm. Vui lòng thử lại sau.',
                'error'   => env('APP_DEBUG') ? $e->getMessage() : 'Lỗi nội bộ máy chủ.',
            ], 500);
        }
    }

    /**
     * Lấy danh sách đánh giá cho một địa điểm check-in cụ thể.
     *
     * @param int $id ID của địa điểm check-in.
     * @return JsonResponse
     */
    public function getPlaceReviews(int $id): JsonResponse
    {
        try {
            $place = CheckinPlace::find($id);

            if (! $place) {
                return response()->json([
                    'success' => false,
                    'message' => 'Địa điểm check-in không tồn tại.',
                ], 404);
            }

            // Lấy các đánh giá đã được duyệt, sắp xếp theo thời gian mới nhất
            $reviews = $place->reviews()
                ->with(['user', 'reviewable']) // Tải thông tin người dùng và đối tượng được đánh giá
                ->where('is_approved', true)
                ->latest()
                ->get();

            if ($reviews->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Chưa có đánh giá nào cho địa điểm này.',
                    'data'    => [],
                ], 200); // Trả về 200 OK với dữ liệu rỗng và thông báo.
            }

            return response()->json([
                'success' => true,
                'message' => 'Lấy đánh giá thành công.',
                'data'    => $reviews,
            ]);
        } catch (Exception $e) {
            Log::error('Lỗi khi lấy đánh giá cho địa điểm ID: ' . $id . ' - ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi tải đánh giá. Vui lòng thử lại sau.',
                'error'   => env('APP_DEBUG') ? $e->getMessage() : 'Lỗi nội bộ máy chủ.',
            ], 500);
        }
    }

    /**
     * Lưu trữ một địa điểm check-in mới.
     *
     * @param Request $request Dữ liệu yêu cầu.
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Giải mã 'operating_hours' nếu nó được gửi dưới dạng chuỗi JSON
            if ($request->has('operating_hours')) {
                $request->merge([
                    'operating_hours' => json_decode($request->input('operating_hours'), true)
                ]);
            }

            // Giải mã 'transport_options' nếu nó được gửi dưới dạng chuỗi JSON
            if ($request->has('transport_options')) {
                $request->merge([
                    'transport_options' => json_decode($request->input('transport_options'), true)
                ]);
            }

            $validated = $this->validateRequest($request);

            /* Xử lý ảnh đại diện --------------------------------------------- */
            if ($request->hasFile('image')) {
                $validated['image'] = $request->file('image')
                    ->store('uploads/checkin', 'public');
            } else {
                $validated['image'] = null;
            }

            /* Xử lý ảnh phụ (gallery) ---------------------------------------- */
            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $img) {
                    $imagePaths[] = $img->store('uploads/checkin', 'public');
                }
            }
            $validated['images'] = $imagePaths;

            /* Xử lý các trường logic và giá trị mặc định --------------------- */
            $validated['operating_hours']   = $validated['operating_hours']   ?? ['all_day' => false, 'open' => null, 'close' => null];
            $validated['transport_options'] = $validated['transport_options'] ?? [];
            $validated['status']            = $validated['status']            ?? 'active';

            $validated['is_free'] = (bool) ($validated['is_free'] ?? false);
            if (($validated['price'] ?? 0) == 0) {
                $validated['is_free'] = true;
                $validated['price']   = null;
            }

            /* Ép kiểu dữ liệu ----------------------------------------------- */
            foreach (['latitude', 'longitude', 'rating', 'price'] as $floatField) {
                if (isset($validated[$floatField]) && $validated[$floatField] === '') {
                    $validated[$floatField] = null;
                }
            }
            $validated['checkin_count'] = (int) ($validated['checkin_count'] ?? 0);
            $validated['review_count']  = (int) ($validated['review_count']  ?? 0);

            $place = CheckinPlace::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Địa điểm check-in đã được tạo thành công.',
                'data'    => $place,
            ], 201); // Trả về mã 201 Created
        } catch (ValidationException $e) {
            Log::error('Lỗi xác thực khi tạo địa điểm: ' . $e->getMessage());
            Log::error($e->errors()); // Log lỗi xác thực chi tiết
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại thông tin.', // Thông báo thân thiện
                'errors'  => $e->errors(), // Giữ lại errors để frontend hiển thị chi tiết
            ], 422); // Trả về mã 422 Unprocessable Entity
        } catch (Exception $e) {
            Log::error('Lỗi khi tạo địa điểm: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi tạo địa điểm. Vui lòng thử lại sau.',
                'error'   => env('APP_DEBUG') ? $e->getMessage() : 'Lỗi nội bộ máy chủ.',
            ], 500);
        }
    }

    /**
     * Cập nhật thông tin của một địa điểm check-in hiện có.
     *
     * @param Request $request Dữ liệu yêu cầu.
     * @param int $id ID của địa điểm check-in cần cập nhật.
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $place = CheckinPlace::find($id);
            if (! $place) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy địa điểm check-in để cập nhật.',
                ], 404);
            }

            // Giải mã 'operating_hours' nếu nó được gửi dưới dạng chuỗi JSON
            if ($request->has('operating_hours')) {
                $request->merge([
                    'operating_hours' => json_decode($request->input('operating_hours'), true)
                ]);
            }

            // Giải mã 'transport_options' nếu nó được gửi dưới dạng chuỗi JSON
            if ($request->has('transport_options')) {
                $request->merge([
                    'transport_options' => json_decode($request->input('transport_options'), true)
                ]);
            }

            $validated = $this->validateRequest($request);

            /* Cập nhật ảnh đại diện ----------------------------------------- */
            if ($request->hasFile('image')) {
                // Xóa ảnh cũ nếu tồn tại
                if ($place->image && Storage::disk('public')->exists($place->image)) {
                    Storage::disk('public')->delete($place->image);
                }
                $validated['image'] = $request->file('image')
                    ->store('uploads/checkin', 'public');
            } else if ($request->input('image_removed') === 'true') { // Xử lý nếu ảnh đại diện bị xóa
                if ($place->image && Storage::disk('public')->exists($place->image)) {
                    Storage::disk('public')->delete($place->image);
                }
                $validated['image'] = null;
            } else {
                // Nếu không có file mới và không có yêu cầu xóa, giữ nguyên ảnh cũ
                unset($validated['image']);
            }

            /* Cập nhật ảnh phụ (gallery): giữ lại ảnh cũ + thêm ảnh mới ------ */
            // Chuyển đổi URL public thành path lưu trữ để so sánh
            $currentImages = array_map(
                fn($img) => str_replace(asset('storage/'), '', $img),
                $request->input('old_images', [])
            );

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $img) {
                    $currentImages[] = $img->store('uploads/checkin', 'public');
                }
            }

            /* Xóa các file ảnh phụ không còn được sử dụng */
            $imagesInDb = is_array($place->images) ? $place->images : (json_decode($place->images, true) ?? []);
            foreach ($imagesInDb as $dbImg) {
                // Kiểm tra xem ảnh cũ có còn trong danh sách ảnh hiện tại không và có tồn tại trên storage không
                if (
                    ! in_array($dbImg, $currentImages) &&
                    Storage::disk('public')->exists($dbImg)
                ) {
                    Storage::disk('public')->delete($dbImg);
                }
            }
            $validated['images'] = $currentImages;

            /* Xử lý logic và ép kiểu tương tự như hàm store() ---------------- */
            $validated['operating_hours']   = $validated['operating_hours']   ?? ['all_day' => false, 'open' => null, 'close' => null];
            $validated['transport_options'] = $validated['transport_options'] ?? [];
            $validated['status']            = $validated['status']            ?? $place->status;

            $validated['is_free'] = (bool) ($validated['is_free'] ?? false);
            if (($validated['price'] ?? 0) == 0) {
                $validated['is_free'] = true;
                $validated['price']   = null;
            }

            foreach (['latitude', 'longitude', 'rating', 'price'] as $floatField) {
                if (isset($validated[$floatField]) && $validated[$floatField] === '') {
                    $validated[$floatField] = null;
                }
            }
            // Không nên tự động cập nhật checkin_count và review_count từ request trong update
            // Những trường này thường được cập nhật thông qua các hành động khác (check-in, review)
            unset($validated['checkin_count']);
            unset($validated['review_count']);

            $place->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Địa điểm check-in đã được cập nhật thành công.',
                'data'    => $place,
            ]);
        } catch (ValidationException $e) {
            Log::error('Lỗi xác thực khi cập nhật địa điểm ' . $id . ': ' . $e->getMessage());
            Log::error($e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại thông tin.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Lỗi khi cập nhật địa điểm ' . $id . ': ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi cập nhật địa điểm. Vui lòng thử lại sau.',
                'error'   => env('APP_DEBUG') ? $e->getMessage() : 'Lỗi nội bộ máy chủ.',
            ], 500);
        }
    }

    /**
     * Xóa một địa điểm check-in.
     *
     * @param int $id ID của địa điểm check-in cần xóa.
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $place = CheckinPlace::find($id);
            if (! $place) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy địa điểm check-in để xóa.',
                ], 404);
            }

            /* Xóa ảnh đại diện liên quan */
            if ($place->image && Storage::disk('public')->exists($place->image)) {
                Storage::disk('public')->delete($place->image);
            }

            /* Xóa tất cả ảnh phụ (gallery) liên quan */
            $auxImages = is_array($place->images) ? $place->images : (json_decode($place->images, true) ?? []);
            foreach ($auxImages as $img) {
                if (Storage::disk('public')->exists($img)) {
                    Storage::disk('public')->delete($img);
                }
            }

            $place->delete();

            return response()->json([
                'success' => true,
                'message' => 'Địa điểm check-in và toàn bộ ảnh liên quan đã được xóa thành công.',
            ]);
        } catch (Exception $e) {
            Log::error('Lỗi khi xóa địa điểm ID: ' . $id . ' - ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi xóa địa điểm. Vui lòng thử lại sau.',
                'error'   => env('APP_DEBUG') ? $e->getMessage() : 'Lỗi nội bộ máy chủ.',
            ], 500);
        }
    }

    /**
     * Lấy các số liệu thống kê liên quan đến địa điểm check-in.
     *
     * @return JsonResponse
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $data = [
                'totalCheckinPlaces'  => CheckinPlace::count(),
                'totalReviews'        => CheckinPlace::sum('review_count'),
                'totalCheckins'       => CheckinPlace::sum('checkin_count'),
                'activeCheckinPlaces' => CheckinPlace::where('status', 'active')->count(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Lấy thống kê thành công.',
                'data'    => $data,
            ]);
        } catch (Exception $e) {
            Log::error('Lỗi khi lấy thống kê: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy số liệu thống kê. Vui lòng thử lại sau.', // Thông báo thân thiện
                'error'   => env('APP_DEBUG') ? $e->getMessage() : 'Lỗi nội bộ máy chủ.',
            ], 500);
        }
    }

    /**
     * Lấy danh sách các địa điểm check-in phổ biến (đề xuất).
     * Sắp xếp theo rating giảm dần, sau đó theo review_count giảm dần.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPopularPlaces(): \Illuminate\Http\JsonResponse
    {
        try {
            Log::info('Bắt đầu lấy danh sách địa điểm check-in đề xuất');

            $places = \App\Models\CheckinPlace::orderByDesc('rating')
                ->orderByDesc('review_count')
                ->limit(8)
                ->get();

            Log::info('Lấy danh sách địa điểm thành công', [
                'count' => $places->count(),
                'first_id' => $places->first() ? $places->first()->id : null
            ]);

            return response()->json([
                'success' => true,
                'data' => $places,
                'metadata' => [
                    'total' => $places->count(),
                    'timestamp' => now()->toDateTimeString()
                ]
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Lỗi truy vấn database khi lấy địa điểm', [
                'error' => $e->getMessage(),
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi truy vấn cơ sở dữ liệu',
                'error_details' => [
                    'code' => $e->getCode(),
                    'message' => $e->getMessage(),
                    'type' => get_class($e)
                ]
            ], 500);
        } catch (\Exception $e) {
            Log::error('Lỗi hệ thống khi lấy địa điểm', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống',
                'error_details' => [
                    'code' => $e->getCode(),
                    'message' => $e->getMessage(),
                    'type' => get_class($e)
                ]
            ], 500);
        }
    }
    private function validateRequest(Request $request): array
    {
        return $request->validate([
            'name'                  => 'required|string|max:255',
            'description'           => 'nullable|string',
            'address'               => 'nullable|string|max:255',
            'latitude'              => 'nullable|numeric',
            'longitude'             => 'nullable|numeric',
            'image'                 => 'nullable|image|max:2048', // Ảnh đại diện, tối đa 2MB
            'rating'                => 'nullable|numeric|min:0|max:5',
            'location_id'           => 'nullable|integer|exists:locations,id',
            'price'                 => 'nullable|numeric|min:0',
            'is_free'               => 'nullable|boolean',
            'operating_hours'       => 'nullable|array',
            'operating_hours.all_day' => 'nullable|boolean',
            'operating_hours.open'  => 'nullable|date_format:H:i',
            'operating_hours.close' => 'nullable|date_format:H:i|after:operating_hours.open',
            'checkin_count'         => 'nullable|integer|min:0',
            'review_count'          => 'nullable|integer|min:0',
            'images'                => 'nullable|array', // Mảng các ảnh phụ
            'images.*'              => 'image|max:2048', // Mỗi ảnh phụ tối đa 2MB
            'old_images'            => 'nullable|array', // Mảng các URL ảnh cũ được giữ lại
            'old_images.*'          => 'nullable|string',
            'region'                => 'nullable|string|max:100',
            'caption'               => 'nullable|string|max:255', // Chú thích, tương ứng với 'note' ở frontend
            'transport_options'     => 'nullable|array',
            'transport_options.*'   => 'nullable|string|max:255',
            'status'                => 'nullable|string|in:active,inactive,draft', // Trạng thái của địa điểm
            'image_removed'         => 'nullable|boolean', // Cờ báo hiệu ảnh đại diện đã bị xóa
        ]);
    }
}
