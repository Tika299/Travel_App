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
    // 📋 Lấy danh sách hãng
    public function index(): JsonResponse
    {
        try {
            $companies = TransportCompany::with('transportation')->get();
            return response()->json(['success' => true, 'data' => $companies], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi khi lấy danh sách', 'error' => $e->getMessage()], 500);
        }
    }

    // 👁️ Chi tiết hãng theo ID
    public function show($id): JsonResponse
    {
        try {
            $company = TransportCompany::with('transportation')->findOrFail($id);
            return response()->json(['success' => true, 'data' => $company], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hãng', 'error' => $e->getMessage()], 404);
        }
    }

    public function getCompanyReviews(int $id): JsonResponse
    {
        $company = TransportCompany::with(['reviews' => function($query) {
            $query->where('is_approved', true) // Chỉ lấy các đánh giá đã được duyệt
                  ->with('user') // Nạp thông tin người dùng
                  ->latest(); // Sắp xếp theo mới nhất
        }])->find($id);

        if (!$company) {
            return response()->json(['message' => 'Hãng vận chuyển không tìm thấy'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $company->reviews,
        ]);
    }
    // ➕ Tạo mới hãng
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateCompany($request);

            // Cast JSON
            $validated['operating_hours'] = $validated['operating_hours'] ?? null;
            $validated['payment_methods'] = $validated['payment_methods'] ?? null;
            $validated['highlight_services'] = $validated['highlight_services'] ?? null;

            $company = TransportCompany::create($validated);

            return response()->json(['success' => true, 'data' => $company], 201);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi khi thêm hãng', 'error' => $e->getMessage()], 500);
        }
    }

    // ✏️ Cập nhật hãng
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $company = TransportCompany::findOrFail($id);
            $validated = $this->validateCompany($request);

            $validated['operating_hours'] = $validated['operating_hours'] ?? null;
            $validated['payment_methods'] = $validated['payment_methods'] ?? null;
            $validated['highlight_services'] = $validated['highlight_services'] ?? null;

            $company->update($validated);

            return response()->json(['success' => true, 'data' => $company], 200);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi khi cập nhật hãng', 'error' => $e->getMessage()], 500);
        }
    }

    // ❌ Xoá hãng
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

    // ✅ Hàm validate dùng chung
    private function validateCompany(Request $request): array
    {
        return $request->validate([
            'transportation_id'      => 'required|integer|exists:transportations,id',
            'province_id'            => 'nullable|integer',
            'name'                   => 'required|string|max:255',
            'short_description'      => 'nullable|string|max:255',
            'description'            => 'nullable|string',
            'address'                => 'required|string',
            'latitude'               => 'required|numeric',
            'longitude'              => 'required|numeric',
            'logo'                   => 'nullable|string|max:255',
            'rating'                 => 'nullable|numeric|min:0|max:5',
            'price_range'            => 'nullable|array',
            'operating_hours'        => 'nullable|array',
            'payment_methods'        => 'nullable|array',
            'highlight_services'     => 'nullable|array',
            'contact_response_time'  => 'nullable|string|max:100',
            'phone_number'           => 'nullable|string|max:50',
            'email'                  => 'nullable|email',
            'website'                => 'nullable|url',
            'has_mobile_app'         => 'boolean',
            'status'                 => 'nullable|in:active,inactive,draft',
        ]);
    }
}
 