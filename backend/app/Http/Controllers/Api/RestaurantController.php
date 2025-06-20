<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RestaurantController extends Controller
{
    public function index(Request $request)
{
    try {
        $query = Restaurant::with('reviews');

        // Filter by price range
        if ($request->filled('price_range')) {
            $query->where('price_range', $request->price_range);
        }

        // Filter by rating
        if ($request->filled('min_rating') && is_numeric($request->min_rating)) {
            $query->where('rating', '>=', $request->min_rating);
        }

        // Sorting
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
        $perPage = min($perPage, 50);

        $restaurants = $query->paginate($perPage);

        return response()->json([
    'success' => true,
    'data' => $restaurants->items(), // <== đây vẫn là mảng
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
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'address' => 'required|string|max:500',
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
                'rating' => 'nullable|numeric|between:0,5',
                'price_range' => 'required|in:$,$$,$$$,$$$$',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

            $restaurant = Restaurant::create($validated);

            return response()->json([
                'success' => true,
                'data' => $restaurant,
                'message' => 'Restaurant created successfully'
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create restaurant',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $restaurant = Restaurant::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'address' => 'sometimes|required|string|max:500',
                'latitude' => 'sometimes|required|numeric|between:-90,90',
                'longitude' => 'sometimes|required|numeric|between:-180,180',
                'rating' => 'nullable|numeric|between:0,5',
                'price_range' => 'sometimes|required|in:$,$$,$$$,$$$$',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            ]);

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