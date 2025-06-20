<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransportCompany;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Exception;

class TransportCompanyController extends Controller
{
    // Lấy danh sách hãng
    public function index(): JsonResponse
    {
        try {
            $companies = TransportCompany::all();
            return response()->json(['success' => true, 'data' => $companies], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi khi lấy danh sách', 'error' => $e->getMessage()], 500);
        }
    }

    // Lấy thông tin hãng theo ID
    public function show($id): JsonResponse
    {
        try {
            $company = TransportCompany::findOrFail($id);
            return response()->json(['success' => true, 'data' => $company], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hãng', 'error' => $e->getMessage()], 404);
        }
    }

    // Thêm hãng mới
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'transportation_id' => 'required|integer|exists:transportations,id',
                'name' => 'required|string|max:255',
                'address' => 'required|string',
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                'rating' => 'nullable|numeric|min:0|max:5',
            ]);

            $company = TransportCompany::create(array_merge($validated, $request->except(['_token'])));

            return response()->json(['success' => true, 'data' => $company], 201);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi khi thêm hãng', 'error' => $e->getMessage()], 500);
        }
    }

    // Cập nhật hãng
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $company = TransportCompany::findOrFail($id);

            $validated = $request->validate([
                'transportation_id' => 'required|integer|exists:transportations,id',
                'name' => 'required|string|max:255',
                'address' => 'required|string',
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                'rating' => 'nullable|numeric|min:0|max:5',
            ]);

            $company->update(array_merge($validated, $request->except(['_token'])));

            return response()->json(['success' => true, 'data' => $company], 200);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi khi cập nhật hãng', 'error' => $e->getMessage()], 500);
        }
    }

    // Xoá hãng
    public function destroy($id): JsonResponse
    {
        try {
            $company = TransportCompany::findOrFail($id);
            $company->delete();

            return response()->json(['success' => true, 'message' => 'Đã xoá hãng thành công.'], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi khi xoá hãng', 'error' => $e->getMessage()], 500);
        }
    }
}
