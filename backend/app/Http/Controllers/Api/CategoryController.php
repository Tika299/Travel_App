<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Resources\CategoryResource;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
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

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:categories,name|max:255',
            'icon' => 'nullable|file|mimes:png,svg|max:2048',
            'type' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except('icon');
        if ($request->hasFile('icon')) {
            $path = $request->file('icon')->store('category_icons', 'public');
            $data['icon'] = $path;
        } else {
            $data['icon'] = $request->input('icon');
        }

        $category = Category::create($data);

        return new CategoryResource($category);
    }

    public function show($id)
    {
        $category = Category::findOrFail($id);
        return new CategoryResource($category);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|unique:categories,name,' . $category->id . '|max:255',
            'icon' => 'nullable|file|mimes:png,svg|max:2048',
            'type' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->except('icon');
        if ($request->hasFile('icon')) {
            $path = $request->file('icon')->store('category_icons', 'public');
            $data['icon'] = $path;
        } else {
            $data['icon'] = $request->input('icon');
        }

        $category->update($data);

        return new CategoryResource($category);
    }

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
