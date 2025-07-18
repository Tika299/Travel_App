<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dish;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\File;


class DishController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 5);
            $search = $request->get('search');
            $category = $request->get('category');
            $restaurant_id = $request->get('restaurant_id');
            $best_sellers_only = $request->get('best_sellers_only');

            $query = Dish::with('restaurant');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%")
                      ->orWhere('category', 'LIKE', "%{$search}%")
                      ->orWhereHas('restaurant', function ($restaurantQuery) use ($search) {
                          $restaurantQuery->where('name', 'LIKE', "%{$search}%");
                      });
                });
            }

            if ($category) {
                $query->byCategory($category);
            }

            if ($restaurant_id) {
                $query->where('restaurant_id', $restaurant_id);
            }

            if ($best_sellers_only) {
                $query->bestSellers();
            }

            $dishes = $query->orderBy('created_at', 'desc')->paginate($perPage);
            $allCategories = Dish::select('category')->distinct()->pluck('category');
            // Transform data to include restaurant info and status
            $transformedDishes = $dishes->getCollection()->map(function ($dish) {
                return [
                    'id' => $dish->id,
                    'name' => $dish->name,
                    'description' => $dish->description,
                    'price' => $dish->price,
                    'formatted_price' => $dish->formatted_price,
                    'category' => $dish->category,
                    'is_best_seller' => $dish->is_best_seller,
                    'image' => $dish->image,
                    'status' => $dish->status,
                    'restaurant' => [
                        'id' => $dish->restaurant->id,
                        'name' => $dish->restaurant->name,
                        'address' => $dish->restaurant->address,
                        'rating' => $dish->restaurant->rating,
                        'price_range' => $dish->restaurant->price_range,
                    ],
                    'location' => $dish->restaurant->address,
                    'region' => $this->getRegionFromAddress($dish->restaurant->address),
                    'created_at' => $dish->created_at,
                    'updated_at' => $dish->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedDishes,
                'categories' => $allCategories,
                'total' => $dishes->total(),
                'current_page' => $dishes->currentPage(),
                'last_page' => $dishes->lastPage(),
                'per_page' => $dishes->perPage(),
                'message' => 'Dishes retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dishes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
{
    try {
        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
            'is_best_seller' => 'boolean',
            'category' => 'required|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Nếu có ảnh upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();

            // Đường dẫn tuyệt đối tới frontend/public/image
            $frontendPath = base_path('../frontend/public/image');

            // Tạo thư mục nếu chưa có
            if (!File::exists($frontendPath)) {
                File::makeDirectory($frontendPath, 0755, true);
            }

            // Lưu ảnh vào thư mục
            $image->move($frontendPath, $filename);

            // Lưu tên ảnh vào DB
            $validated['image'] = 'image/' . $filename;
        }

        $dish = Dish::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Dish created successfully',
            'data' => $dish,
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors(),
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to create dish',
            'error' => $e->getMessage(),
        ], 500);
    }
}

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
{
    try {
        $dish = Dish::with('restaurant')->findOrFail($id);

        $transformedDish = [
            'id' => $dish->id,
            'name' => $dish->name,
            'description' => $dish->description,
            'price' => $dish->price,
            'formatted_price' => $dish->formatted_price,
            'category' => $dish->category,
            'is_best_seller' => $dish->is_best_seller,
            'image' => $dish->image,
            'status' => $dish->status,
            'restaurant_id' => $dish->restaurant_id,
            'restaurant' => [
                'id' => $dish->restaurant->id,
                'name' => $dish->restaurant->name,
                'address' => $dish->restaurant->address,
                'rating' => $dish->restaurant->rating,
                'price_range' => $dish->restaurant->price_range,
            ],
            'location' => $dish->restaurant->address,
            'region' => $this->getRegionFromAddress($dish->restaurant->address),
            'created_at' => $dish->created_at,
            'updated_at' => $dish->updated_at,
        ];

        return response()->json([
            'success' => true,
            'data' => $transformedDish,
            'message' => 'Dish retrieved successfully',
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve dish',
            'error' => $e->getMessage(),
        ], 404);
    }
}

    /**
     * Update the specified resource in storage.
     */
public function update(Request $request, $id): JsonResponse
{
    $dishe = Dish::find($id);

    if (!$dishe) {
        return response()->json(['message' => 'Dish not found'], 404);
    }

    $validated = $request->validate([
        'restaurant_id'   => 'required|exists:restaurants,id',
        'name'            => 'required|string|max:255',
        'price'           => 'required|numeric|min:0',
        'description'     => 'required|string',
        'is_best_seller'  => 'nullable|boolean',
        'category'        => 'required|string|max:100',
        'image'           => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
    ]);

    // Cập nhật ảnh nếu có
    if ($request->hasFile('image')) {
        // Xóa ảnh cũ nếu có
        if ($dishe->image && Storage::disk('public')->exists($dishe->image)) {
            Storage::disk('public')->delete($dishe->image);
        }

        $imagePath = $request->file('image')->store('dishes', 'public');
        $dishe->image = $imagePath;
    }

    $dishe->restaurant_id  = $validated['restaurant_id'];
    $dishe->name           = $validated['name'];
    $dishe->price          = $validated['price'];
    $dishe->description    = $validated['description'];
    $dishe->is_best_seller = $validated['is_best_seller'] ?? false;
    $dishe->category       = $validated['category'];

    $dishe->save();

    return response()->json([
        'message' => 'Dish updated successfully',
        'data'    => $dishe
    ]);
}




    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Dish $dish): JsonResponse
{
    try {
        // Xóa file hình ảnh nếu có
        if ($dish->image && File::exists(public_path('image/' . $dish->image))) {
            File::delete(public_path('image/' . $dish->image));
        }

        $dish->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dish deleted successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete dish',
            'error' => $e->getMessage()
        ], 500);
    }
}
    /**
     * Get dishes by category
     */
    public function getByCategory(Request $request, $category): JsonResponse
    {
        try {
            $dishes = Dish::with('restaurant')
                         ->byCategory($category)
                         ->orderBy('created_at', 'desc')
                         ->get();

            $transformedDishes = $dishes->map(function ($dish) {
                return $this->transformDish($dish);
            });

            return response()->json([
                'success' => true,
                'data' => $transformedDishes,
                'total' => $dishes->count(),
                'message' => 'Dishes by category retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dishes by category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get best seller dishes
     */
    public function getBestSellers(): JsonResponse
    {
        try {
            $dishes = Dish::with('restaurant')
                         ->bestSellers()
                         ->orderBy('created_at', 'desc')
                         ->get();

            $transformedDishes = $dishes->map(function ($dish) {
                return $this->transformDish($dish);
            });

            return response()->json([
                'success' => true,
                'data' => $transformedDishes,
                'total' => $dishes->count(),
                'message' => 'Best seller dishes retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve best seller dishes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transform dish data
     */
    private function transformDish($dish): array
    {
        return [
            'id' => $dish->id,
            'name' => $dish->name,
            'description' => $dish->description,
            'price' => $dish->price,
            'formatted_price' => $dish->formatted_price,
            'category' => $dish->category,
            'is_best_seller' => $dish->is_best_seller,
            'image' => $dish->image,
            'status' => $dish->status,
            'restaurant' => [
                'id' => $dish->restaurant->id,
                'name' => $dish->restaurant->name,
                'address' => $dish->restaurant->address,
                'rating' => $dish->restaurant->rating,
                'price_range' => $dish->restaurant->price_range,
            ],
            'location' => $dish->restaurant->address,
            'region' => $this->getRegionFromAddress($dish->restaurant->address),
            'created_at' => $dish->created_at,
            'updated_at' => $dish->updated_at,
        ];
    }

    /**
     * Get region from address
     */
    private function getRegionFromAddress($address): string
    {
        if (str_contains(strtolower($address), 'hà nội') || str_contains(strtolower($address), 'hanoi')) {
            return 'Bắc';
        } elseif (str_contains(strtolower($address), 'huế') || str_contains(strtolower($address), 'đà nẵng')) {
            return 'Trung';
        } elseif (str_contains(strtolower($address), 'tp.hcm') || str_contains(strtolower($address), 'sài gòn')) {
            return 'Nam';
        }
        return 'Khác';
    }
}