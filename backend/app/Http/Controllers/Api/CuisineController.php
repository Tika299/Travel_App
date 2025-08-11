<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cuisine;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\CuisineImport;
use App\Http\Resources\CuisineResource;

class CuisineController extends Controller
{
    /**
     * Import cuisines from an Excel file.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function importCuisines(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:xlsx,xls|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'File không hợp lệ. Vui lòng chọn file Excel (.xlsx hoặc .xls) dưới 2MB.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();
            
            Excel::import(new CuisineImport, $request->file('file'));
            
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Import dữ liệu ẩm thực thành công!',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi import ẩm thực: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi import ẩm thực: ' . $e->getMessage(),
            ], 500);
        }
    }

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
            'image' => 'nullable|image|max:5120', // max 5MB
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $validator->validated();

        // Xử lý upload file ảnh nếu có
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $path = $file->store('cuisine', 'public');
            $data['image'] = asset('storage/' . $path);
        } else if ($request->has('image') && is_string($request->image)) {
            // Nếu gửi URL ảnh
            $data['image'] = $request->image;
        }

        $cuisine = Cuisine::create($data);

        return new CuisineResource($cuisine);
    }

    public function show($id)
    {
        $cuisine = Cuisine::with('category')->findOrFail($id);
        // Lấy các món cùng category (trừ chính nó), tối đa 4
        $relatedCuisines = \App\Models\Cuisine::where('categories_id', $cuisine->categories_id)
            ->where('id', '!=', $cuisine->id)
            ->limit(4)
            ->get();
        return response()->json([
            'data' => new \App\Http\Resources\CuisineResource($cuisine),
            'priceDetails' => $relatedCuisines->map(function ($item) {
                return [
                    'name' => $item->name,
                    'price' => number_format($item->price, 0, ',', '.') . 'đ',
                ];
            }),
        ]);
    }

    public function update(Request $request, $id)
    {
        $cuisine = Cuisine::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'categories_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'short_description' => 'sometimes|required|string',
            'detailed_description' => 'sometimes|nullable|string',
            'price' => 'sometimes|required|integer|min:0',
            'region' => 'sometimes|required|in:Miền Bắc,Miền Trung,Miền Nam',
            'address' => 'sometimes|required|string',
            'delivery' => 'sometimes|boolean',
            'image' => 'nullable|image|max:5120',
            'operating_hours' => 'sometimes|nullable|string',
            'serving_time' => 'sometimes|nullable|string',
            'suitable_for' => 'sometimes|nullable|string',
            'status' => 'sometimes|required|in:available,unavailable',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $validator->validated();

        // Log dữ liệu trước khi update
        Log::info('Update data:', $data);

        // Chuyển null thành chuỗi rỗng cho các trường string
        foreach (['operating_hours', 'serving_time', 'suitable_for', 'detailed_description'] as $field) {
            if (array_key_exists($field, $data) && $data[$field] === null) {
                $data[$field] = '';
            }
        }

        // Xử lý upload file ảnh nếu có
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $path = $file->store('cuisine', 'public');
            $data['image'] = asset('storage/' . $path);
        } else if ($request->has('image') && is_string($request->image)) {
            $data['image'] = $request->image;
        }

        $updated = $cuisine->update($data);
        Log::info('Update result:', ['updated' => $updated, 'after' => $cuisine->toArray()]);

        return new CuisineResource($cuisine);
    }

    // Hoặc lấy 4 món mới nhất
    public function getLatestCuisines()
    {
        $cuisines = Cuisine::with('category')
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        return response()->json([
            'success' => true,
            'data' => CuisineResource::collection($cuisines),
        ]);
    }

    public function destroy($id)
    {
        $cuisine = Cuisine::findOrFail($id);
        $cuisine->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
