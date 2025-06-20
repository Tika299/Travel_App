<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cuisine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\CuisineResource;

class CuisineController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/cuisines",
     *     summary="Lấy danh sách các món ăn",
     *     tags={"Cuisines"},
     *     @OA\Parameter(
     *         name="category_id",
     *         in="query",
     *         description="Lọc món ăn theo ID danh mục",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="region",
     *         in="query",
     *         description="Lọc món ăn theo miền (Miền Bắc, Miền Trung, Miền Nam)",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Tìm kiếm món ăn theo tên hoặc mô tả",
     *         @OA\Schema(type="string")
     *     ),
     *      @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Số lượng kết quả mỗi trang (mặc định 15)",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Thành công"),
     * )
     */
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

    /**
     * @OA\Post(
     *     path="/api/cuisines",
     *     summary="Tạo một món ăn mới",
     *     tags={"Cuisines"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CuisineStoreRequest")
     *     ),
     *     @OA\Response(response=201, description="Tạo thành công"),
     *     @OA\Response(response=422, description="Dữ liệu không hợp lệ")
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/cuisines/{id}",
     *     summary="Lấy thông tin chi tiết một món ăn",
     *     tags={"Cuisines"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID của món ăn",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function show($id)
    {
        $cuisine = Cuisine::findOrFail($id);
        // Eager load các relationship cần thiết
        $cuisine->load('category');
        return new CuisineResource($cuisine);
    }

    /**
     * @OA\Put(
     *     path="/api/cuisines/{id}",
     *     summary="Cập nhật thông tin món ăn",
     *     tags={"Cuisines"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID của món ăn",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CuisineUpdateRequest")
     *     ),
     *     @OA\Response(response=200, description="Cập nhật thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
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

    /**
     * @OA\Delete(
     *     path="/api/cuisines/{id}",
     *     summary="Xóa một món ăn",
     *     tags={"Cuisines"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID của món ăn",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=204, description="Xóa thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function destroy($id)
    {
        $cuisine = Cuisine::findOrFail($id);
        $cuisine->delete();
        return response()->noContent();
    }
}