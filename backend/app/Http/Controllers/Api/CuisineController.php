<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cuisine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\CuisineResource;

class CuisineController extends Controller
{
    public function index(Request $request)
    {
        // Khởi tạo query builder
        $query = Cuisine::query()->with('category'); // Eager load category

        // Lọc theo danh mục (category_id)
        if ($request->has('category_id')) {
            $query->where('categories_id', $request->input('category_id'));
        }

        // Lọc theo miền (region)
        if ($request->has('region')) {
            $query->where('region', $request->input('region'));
        }
        
        // Tìm kiếm theo tên hoặc mô tả
        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('short_description', 'like', "%{$searchTerm}%");
            });
        }
        
        // Sắp xếp (ví dụ: mới nhất)
        $query->latest();

        // Phân trang
        $perPage = $request->input('per_page', 15); // Mặc định 15 item mỗi trang
        $cuisines = $query->paginate($perPage);

        // Trả về dữ liệu qua API Resource
        return CuisineResource::collection($cuisines);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'categories_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'short_description' => 'required|string',
            'price' => 'required|integer|min:0',
            'region' => 'required|in:Miền Bắc,Miền Trung,Miền Nam',
            'address' => 'required|string',
            'delivery' => 'sometimes|boolean',
            'image' => 'nullable|string|url',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $cuisine = Cuisine::create($validator->validated());

        return new CuisineResource($cuisine);
    }

    public function show($id)
    {
        $cuisine = Cuisine::findOrFail($id);
        // Eager load các relationship cần thiết
        $cuisine->load('category');
        return new CuisineResource($cuisine);
    }

    public function update(Request $request, $id)
    {
        $cuisine = Cuisine::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'categories_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'short_description' => 'sometimes|required|string',
            'price' => 'sometimes|required|integer|min:0',
            'region' => 'sometimes|required|in:Miền Bắc,Miền Trung,Miền Nam',
            'address' => 'sometimes|required|string',
            'delivery' => 'sometimes|boolean',
            'image' => 'nullable|string|url',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $cuisine->update($validator->validated());

        return new CuisineResource($cuisine);
    }

    public function destroy($id)
    {
        $cuisine = Cuisine::findOrFail($id);
        $cuisine->delete();
        return response()->noContent();
    }
}