<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Resources\CategoryResource;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/categories",
     *     summary="Lấy danh sách tất cả danh mục",
     *     tags={"Categories"},
     *     @OA\Parameter(
     *          name="with_cuisines_count",
     *          in="query",
     *          description="Đếm số món ăn trong mỗi danh mục (true/false)",
     *          @OA\Schema(type="boolean")
     *      ),
     *     @OA\Response(response=200, description="Thành công")
     * )
     */
    public function index(Request $request)
    {
        $query = Category::query();

        // Nếu có yêu cầu đếm số lượng món ăn
        if ($request->boolean('with_cuisines_count')) {
            $query->withCount('cuisines');
        }

        $categories = $query->get();

        return CategoryResource::collection($categories);
    }

    /**
     * @OA\Post(
     *     path="/api/categories",
     *     summary="Tạo một danh mục mới",
     *     tags={"Categories"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Đồ nướng"),
     *             @OA\Property(property="icon", type="string", example="fa-fire"),
     *             @OA\Property(property="type", type="string", example="food")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tạo thành công"),
     *     @OA\Response(response=422, description="Dữ liệu không hợp lệ")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:categories,name|max:255',
            'icon' => 'nullable|string|max:50',
            'type' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $category = Category::create($validator->validated());

        return new CategoryResource($category);
    }

    /**
     * @OA\Get(
     *     path="/api/categories/{id}",
     *     summary="Lấy thông tin chi tiết một danh mục",
     *     tags={"Categories"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Thành công"),
     *     @OA\Response(response=404, description="Không tìm thấy")
     * )
     */
    public function show($id)
    {
        $category = Category::findOrFail($id);
        return new CategoryResource($category);
    }

    /**
     * @OA\Put(
     *     path="/api/categories/{id}",
     *     summary="Cập nhật một danh mục",
     *     tags={"Categories"},
     *     @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          @OA\Schema(type="integer")
     *      ),
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/CategoryUpdateRequest")
     *      ),
     *     @OA\Response(response=200, description="Cập nhật thành công")
     * )
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|unique:categories,name,' . $category->id . '|max:255',
            'icon' => 'nullable|string|max:50',
            'type' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $category->update($validator->validated());

        return new CategoryResource($category);
    }

    /**
     * @OA\Delete(
     *     path="/api/categories/{id}",
     *     summary="Xóa một danh mục",
     *     tags={"Categories"},
     *     @OA\Parameter(
     *          name="id",
     *          in="path",
     *          required=true,
     *          @OA\Schema(type="integer")
     *      ),
     *     @OA\Response(response=204, description="Xóa thành công")
     * )
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        
        // Kiểm tra xem danh mục có món ăn nào không trước khi xóa
        if ($category->cuisines()->exists()) {
            return response()->json([
                'message' => 'Không thể xóa danh mục này vì vẫn còn món ăn liên quan.'
            ], 409); // 409 Conflict
        }

        $category->delete();

        return response()->noContent();
    }
}
