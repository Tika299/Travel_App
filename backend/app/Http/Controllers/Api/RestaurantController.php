<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\File;


class RestaurantController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Restaurant::with('reviews');
            if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
            }
            // Filter giá
            if ($request->filled('min_price') && is_numeric($request->min_price)) {
                $query->where('price_range', '>=', $request->min_price);
            }

            if ($request->filled('max_price') && is_numeric($request->max_price)) {
                $query->where('price_range', '<=', $request->max_price);
            }

            // Filter đánh giá
            if ($request->filled('min_rating') && is_numeric($request->min_rating)) {
                $query->where('rating', '>=', $request->min_rating);
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $allowedSortFields = ['name', 'rating', 'created_at', 'price_range'];

            if (in_array($sortBy, $allowedSortFields)) {
                if ($sortBy === 'rating') {
                    $query->orderByDesc('rating');
                } else {
                    $query->orderBy($sortBy, $sortOrder);
                }
            }

            // Pagination
            $perPage = (int) $request->get('per_page', 9);
            $perPage = min($perPage, 1000); // giới hạn tối đa 1000 items

            $restaurants = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $restaurants->items(),
                'pagination' => [
                    'current_page' => $restaurants->currentPage(),
                    'last_page' => $restaurants->lastPage(),
                    'per_page' => $restaurants->perPage(),
                    'total' => $restaurants->total(),
                    'from' => $restaurants->firstItem(),
                    'to' => $restaurants->lastItem()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch restaurants',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }


    public function show($id)
    {
        try {
            $restaurant = Restaurant::with(['reviews'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $restaurant
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch restaurant',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function store(Request $request)
{
    try {
        $validated = $request->validate([
            'name' => [
            'required',
            'string',
            'max:255',
            'regex:/^[\p{L}\p{N}\s]+$/u' // ✅ Không ký tự đặc biệt, hỗ trợ Unicode
                ],
            'description' => 'nullable|string|max:1000',
            'address' => 'required|string|max:500',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'rating' => 'nullable|numeric|between:0,5',
            'price_range' => [
            'required',
            'string',
            'regex:/^(\d{1,3}(,\d{3})*)(\s*-\s*\d{1,3}(,\d{3})*)?\s*VND$/'
                ],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            
        ]);
        // Kiểm tra Kinh Độ Và Vĩ Độ 
        $errors = [];

        if ($validated['latitude'] < -90 || $validated['latitude'] > 90) {
            $errors['latitude'][] = 'Vĩ độ phải nằm trong khoảng -90 đến 90.';
        }

        if ($validated['longitude'] < -180 || $validated['longitude'] > 180) {
            $errors['longitude'][] = 'Kinh độ phải nằm trong khoảng -180 đến 180.';
        }

        if (!empty($errors)) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $errors,
            ], 422);
        }

        // Kiểm Tra Giá Trị Hợp Lệ
        $allowedRanges = [
            '100,000 - 300,000 VND',
            '300,000 - 500,000 VND',
            '500,000 - 800,000 VND',
            '1,000,000 - 1,500,000 VND',
            '1,800,000 VND',
        ];

        if (!in_array($validated['price_range'], $allowedRanges)) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => [
                    'price_range' => ['Giá trị price_range không hợp lệ.'],
                ],
            ], 422);
        }

        // Kiểm tra Ký Tự Lặp
        function hasRepeatedCharacters($string, $limit = 3) {
            return preg_match('/(.)\1{' . $limit . ',}/u', $string); // có /u để hỗ trợ Unicode
        }

        if (hasRepeatedCharacters($validated['name'])) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => [
                    'name' => ['Tên không được chứa ký tự lặp quá nhiều lần.'],
                ],
            ], 422);
        }

        // Handle image if provided
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();

            // Path to frontend/public/image
            $frontendPath = base_path('../frontend/public/image');

            if (!File::exists($frontendPath)) {
                File::makeDirectory($frontendPath, 0755, true);
            }

            $image->move($frontendPath, $filename);
            $validated['image'] = 'image/' . $filename; // Relative path
        }

        // Create restaurant
        $restaurant = Restaurant::create($validated);

        return response()->json([
            'success' => true,
            'data' => $restaurant,
            'message' => 'Restaurant created successfully',
        ], 201);

    } catch (ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors(),
        ], 422);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to create restaurant',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
        ], 500);
    }
}

    public function update(Request $request, $id)
    {
        try {
            $restaurant = Restaurant::findOrFail($id);

            $validated = $request->validate([
                'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[\p{L}\p{N}\s]+$/u' // ✅ Không ký tự đặc biệt, hỗ trợ Unicode
                ],
                'description' => 'nullable|string|max:1000',
                'address' => 'sometimes|required|string|max:500',
                'latitude' => 'sometimes|required|numeric|between:-90,90',
                'longitude' => 'sometimes|required|numeric|between:-180,180',
                'rating' => 'nullable|numeric|between:0,5',
                'price_range' => 'required|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);
            function hasRepeatedCharacters($string, $limit = 3) {
            return preg_match('/(.)\1{' . $limit . ',}/u', $string); // có /u để hỗ trợ Unicode
        }

        if (hasRepeatedCharacters($validated['name'])) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => [
                    'name' => ['Tên không được chứa ký tự lặp quá nhiều lần.'],
                ],
            ], 422);
        }
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $filename = time() . '_' . $image->getClientOriginalName();

                // Path to frontend/public/image
                $frontendPath = base_path('../frontend/public/image');

                // Tạo thư mục nếu chưa có
                if (!File::exists($frontendPath)) {
                    File::makeDirectory($frontendPath, 0755, true);
                }

                // ✅ Xóa ảnh cũ nếu tồn tại
                if ($restaurant->image && File::exists($frontendPath . '/' . basename($restaurant->image))) {
                    File::delete($frontendPath . '/' . basename($restaurant->image));
                }

                // Lưu ảnh mới
                $image->move($frontendPath, $filename);
                $validated['image'] = 'image/' . $filename; // Relative path
            } else {
                $validated['image'] = $restaurant->image;
            }

            $restaurant->update($validated);

            return response()->json([
                'success' => true,
                'data' => $restaurant->fresh(),
                'message' => 'Restaurant updated successfully'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update restaurant',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function destroy($id)
{
    try {
        $restaurant = Restaurant::findOrFail($id);

        // Xóa ảnh từ frontend/public/image nếu tồn tại
        if ($restaurant->image) {
            $imagePath = base_path('../frontend/public/' . $restaurant->image);
            if (File::exists($imagePath)) {
                File::delete($imagePath);
            }
        }

        $restaurant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Restaurant deleted successfully'
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Restaurant not found'
        ], 404);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete restaurant',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
        ], 500);
    }
}
}
