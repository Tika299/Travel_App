<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckinPlace;
use App\Models\CheckinPhoto;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Exception;

class CheckinPlaceController extends Controller
{
    public function index(): JsonResponse
    {
        // Đã xóa 'checkinPhotos'
        $places = CheckinPlace::with('linkedHotels.hotel')->get();

        return response()->json([
            'success' => true,
            'data'    => $places,
        ]);
    }

    public function show($id): JsonResponse
    {
        try {
            // Kiểm tra ID có tồn tại và là số nguyên dương
            if (!is_numeric($id)) {
                throw new \InvalidArgumentException('ID phải là số');
            }

            $id = (int)$id;

            if ($id <= 0) {
                throw new \InvalidArgumentException('ID phải là số nguyên dương');
            }

            // Tìm địa điểm với quan hệ hotels nếu cần
            $place = CheckinPlace::with('linkedHotels.hotel')->find($id);

            if (!$place) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy địa điểm',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $place,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getPlaceReviews(int $id): JsonResponse
    {
        try {
            $place = CheckinPlace::find($id);

            if (! $place) {
                return response()->json([
                    'success' => false,
                    'message' => 'Địa điểm check‑in không tồn tại.',
                ], 404);
            }

            $reviews = $place->reviews()
                ->with(['user', 'reviewable'])
                ->where('is_approved', true)
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Lấy đánh giá thành công.',
                'data'    => $reviews,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateRequest($request);

            /* Ảnh đại diện --------------------------------------------------- */
            if ($request->hasFile('image')) {
                $validated['image'] = $request->file('image')
                    ->store('uploads/checkin', 'public');
            } else {
                $validated['image'] = null;
            }

            /* Ảnh phụ -------------------------------------------------------- */
            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $img) {
                    $imagePaths[] = $img->store('uploads/checkin', 'public');
                }
            }
            $validated['images'] = $imagePaths;

            /* Trường logic --------------------------------------------------- */
            $validated['operating_hours']   = $validated['operating_hours']   ?? ['open' => '', 'close' => ''];
            $validated['transport_options'] = $validated['transport_options'] ?? [];
            $validated['status']            = $validated['status']            ?? 'active';

            $validated['is_free'] = (bool) ($validated['is_free'] ?? false);
            if (($validated['price'] ?? 0) == 0) {
                $validated['is_free'] = true;
                $validated['price']   = null;
            }

            /* Ép kiểu -------------------------------------------------------- */
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
                'data'    => $place,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo địa điểm.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $place = CheckinPlace::find($id);
            if (! $place) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy địa điểm',
                ], 404);
            }

            $validated = $this->validateRequest($request);

            /* Ảnh đại diện --------------------------------------------------- */
            if ($request->hasFile('image')) {
                if ($place->image && Storage::disk('public')->exists($place->image)) {
                    Storage::disk('public')->delete($place->image);
                }
                $validated['image'] = $request->file('image')
                    ->store('uploads/checkin', 'public');
            }

            /* Ảnh phụ: giữ lại ảnh cũ + thêm ảnh mới ------------------------ */
            $currentImages = array_map(
                fn($img) => str_replace('/storage/', '', $img),
                $request->input('old_images', [])
            );

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $img) {
                    $currentImages[] = $img->store('uploads/checkin', 'public');
                }
            }

            /* Xoá file không còn dùng */
            $imagesInDb = is_array($place->images) ? $place->images : (json_decode($place->images, true) ?? []);
            foreach ($imagesInDb as $dbImg) {
                if (
                    ! in_array($dbImg, $currentImages) &&
                    Storage::disk('public')->exists($dbImg)
                ) {
                    Storage::disk('public')->delete($dbImg);
                }
            }
            $validated['images'] = $currentImages;

            /* Logic & ép kiểu giống store() --------------------------------- */
            $validated['operating_hours']   = $validated['operating_hours']   ?? ['open' => '', 'close' => ''];
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
            $validated['checkin_count'] = (int) ($validated['checkin_count'] ?? 0);
            $validated['review_count']  = (int) ($validated['review_count']  ?? 0);

            $place->update($validated);

            return response()->json([
                'success' => true,
                'data'    => $place,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $place = CheckinPlace::find($id);
            if (! $place) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy địa điểm',
                ], 404);
            }

            /* Xoá ảnh đại diện */
            if ($place->image && Storage::disk('public')->exists($place->image)) {
                Storage::disk('public')->delete($place->image);
            }

            /* Xoá ảnh phụ */
            $auxImages = is_array($place->images) ? $place->images : (json_decode($place->images, true) ?? []);
            foreach ($auxImages as $img) {
                if (Storage::disk('public')->exists($img)) {
                    Storage::disk('public')->delete($img);
                }
            }

            /* Xoá ảnh check‑in người dùng */
            // Nếu bạn không muốn sử dụng mối quan hệ 'checkinPhotos' nữa,
            // bạn cũng nên xóa hoặc comment đoạn code này nếu nó gây lỗi
            // hoặc nếu bảng 'checkin_photos' không còn tồn tại hoặc liên quan.
            // foreach ($place->checkinPhotos as $photo) {
            //     if ($photo->image && Storage::disk('public')->exists($photo->image)) {
            //         Storage::disk('public')->delete($photo->image);
            //     }
            //     $photo->delete();
            // }

            $place->delete();

            return response()->json([
                'success' => true,
                'message' => 'Đã xoá địa điểm và toàn bộ ảnh liên quan.',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xoá: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getStatistics(): JsonResponse
    {
        try {
            $data = [
                'totalCheckinPlaces'  => CheckinPlace::count(),
                'totalReviews'        => Review::count(),
                'totalCheckins'       => CheckinPhoto::count(),
                'activeCheckinPlaces' => CheckinPlace::where('status', 'active')->count(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Lấy thống kê thành công.',
                'data'    => $data,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy thống kê: ' . $e->getMessage(),
            ], 500);
        }
    }
    // Lấy danh sách địa điểm check‑in đề xuất
    // Lấy danh sách địa điểm check-in đề xuất
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
            'name'                      => 'required|string|max:255',
            'description'               => 'nullable|string',
            'address'                   => 'nullable|string|max:255',
            'latitude'                  => 'nullable|numeric',
            'longitude'                 => 'nullable|numeric',
            'image'                     => 'nullable|image|max:2048',
            'rating'                    => 'nullable|numeric|min:0|max:5',
            'location_id'               => 'nullable|integer|exists:locations,id',
            'price'                     => 'nullable|numeric|min:0',
            'is_free'                   => 'nullable|boolean',
            'operating_hours'           => 'nullable|array',
            'operating_hours.open'      => 'nullable|date_format:H:i',
            'operating_hours.close'     => 'nullable|date_format:H:i|after:operating_hours.open',
            'checkin_count'             => 'nullable|integer|min:0',
            'review_count'              => 'nullable|integer|min:0',
            'images'                    => 'nullable|array',
            'images.*'                  => 'image|max:2048',
            'old_images'                => 'nullable|array',
            'old_images.*'              => 'nullable|string',
            'region'                    => 'nullable|string|max:100',
            'caption'                   => 'nullable|string|max:255',
            // 🚫 KHÔNG CÒN distance
            'transport_options'         => 'nullable|array',
            'transport_options.*'       => 'nullable|string|max:255',
            'status'                    => 'nullable|string|in:active,inactive,draft',
        ]);
    }
}
