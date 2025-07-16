<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transportation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            'icon' => 'required|string',
            'banner' => 'nullable|string',
            'average_price' => 'nullable|numeric',
            'description' => 'nullable|string',
            'tags' => 'nullable|array',
            'features' => 'nullable|array',
            'rating' => 'nullable|numeric|min:0|max:5',
            'is_visible' => 'boolean',
        ]);

        $transportation = Transportation::create($data);

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
            'icon' => 'sometimes|required|string',
            'banner' => 'nullable|string',
            'average_price' => 'nullable|numeric',
            'description' => 'nullable|string',
            'tags' => 'nullable|array',
            'features' => 'nullable|array',
            'rating' => 'nullable|numeric|min:0|max:5',
            'is_visible' => 'boolean',
        ]);

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

        $transportation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa thành công'
        ]);
    }
}
