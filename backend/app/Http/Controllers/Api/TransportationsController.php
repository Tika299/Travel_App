<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transportation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TransportationsController extends Controller
{
    public function getSuggested(): JsonResponse
    {
        $transportations = Transportation::where('is_visible', true)
            ->orderByDesc('rating')
            ->limit(8)
            ->get();

        if ($transportations->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $transportations
        ]);
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Transportation::all()
        ]);
    }

    public function show($id): JsonResponse
    {
        $transportation = Transportation::find($id);

        if (!$transportation) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $transportation
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'required|image|mimes:jpeg,png,jpg,svg|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:4096',
            'average_price' => 'nullable|numeric',
            'description' => 'nullable|string',
            'tags' => 'nullable|array',
            'features' => 'nullable|array',
            'rating' => 'nullable|numeric|min:0|max:5',
            'is_visible' => 'boolean',
        ]);

        // Upload icon
        $data['icon'] = $request->file('icon')->store('uploads/transportations', 'public');

        // Upload banner nếu có
        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')->store('uploads/transportations', 'public');
        }

        // Lưu
        $transportation = Transportation::create([
            'name' => $data['name'],
            'icon' => $data['icon'],
            'banner' => $data['banner'] ?? null,
            'average_price' => $data['average_price'] ?? null,
            'description' => $data['description'] ?? null,
            'tags' => $data['tags'] ?? [],
            'features' => $data['features'] ?? [],
            'rating' => $data['rating'] ?? null,
            'is_visible' => $data['is_visible'] ?? false,
        ]);

        return response()->json([
            'success' => true,
            'data' => $transportation
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $transportation = Transportation::find($id);

        if (!$transportation) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy'
            ], 404);
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'icon' => 'sometimes|image|mimes:jpeg,png,jpg,svg|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:4096',
            'average_price' => 'nullable|numeric',
            'description' => 'nullable|string',
            'tags' => 'nullable|array',
            'features' => 'nullable|array',
            'rating' => 'nullable|numeric|min:0|max:5',
            'is_visible' => 'boolean',
        ]);

        if ($request->hasFile('icon')) {
            // Xóa icon cũ nếu có
            if ($transportation->icon) {
                Storage::disk('public')->delete($transportation->icon);
            }
            $data['icon'] = $request->file('icon')->store('uploads/transportations', 'public');
        }

        if ($request->hasFile('banner')) {
            if ($transportation->banner) {
                Storage::disk('public')->delete($transportation->banner);
            }
            $data['banner'] = $request->file('banner')->store('uploads/transportations', 'public');
        }

        $transportation->update($data);

        return response()->json([
            'success' => true,
            'data' => $transportation
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $transportation = Transportation::find($id);

        if (!$transportation) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy'
            ], 404);
        }

        if ($transportation->icon) {
            Storage::disk('public')->delete($transportation->icon);
        }
        if ($transportation->banner) {
            Storage::disk('public')->delete($transportation->banner);
        }

        $transportation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa thành công'
        ]);
    }
}
