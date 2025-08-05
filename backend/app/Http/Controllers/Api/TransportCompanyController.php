<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransportCompany;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Exception;
use Illuminate\Support\Facades\Storage; // Import Storage facade for file operations
use Illuminate\Support\Facades\Validator; // Import Validator facade

class TransportCompanyController extends Controller
{
    /**
     * Lấy danh sách các hãng vận tải.
     */
    public function index(): JsonResponse
    {
        try {
            // Lấy tất cả các hãng vận tải và nạp kèm thông tin loại phương tiện.
            $companies = TransportCompany::with('transportation')->get();
            return response()->json(['success' => true, 'data' => $companies], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi khi lấy danh sách', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Lấy chi tiết một hãng vận tải theo ID.
     */
    public function show($id): JsonResponse
    {
        try {
            // Tìm hãng vận tải theo ID và nạp kèm thông tin loại phương tiện, nếu không tìm thấy sẽ trả về 404.
            $company = TransportCompany::with('transportation')->findOrFail($id);
            return response()->json(['success' => true, 'data' => $company], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hãng', 'error' => $e->getMessage()], 404);
        }
    }

    /**
     * Tạo mới một hãng vận tải.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Validate dữ liệu từ request.
            $validated = $this->validateCompany($request);

            // Xử lý lưu logo sau khi validate thành công.
            if ($request->hasFile('logo')) {
                // Lưu file vào thư mục 'logos' trong public disk.
                $imagePath = $request->file('logo')->store('logos', 'public');
                $validated['logo'] = '/storage/' . $imagePath;
            } else {
                // Nếu không có file logo, gán giá trị null cho trường 'logo'.
                $validated['logo'] = null;
            }

            // Tạo bản ghi mới trong cơ sở dữ liệu.
            $company = TransportCompany::create($validated);

            return response()->json(['success' => true, 'data' => $company], 201);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi khi thêm hãng', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Cập nhật thông tin một hãng vận tải.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $company = TransportCompany::findOrFail($id);
            $validated = $this->validateCompany($request);

            // Xử lý logo khi cập nhật.
            if ($request->hasFile('logo')) {
                // Xóa logo cũ nếu có.
                if ($company->logo) {
                    $oldLogoPath = str_replace('/storage/', '', $company->logo);
                    if (Storage::disk('public')->exists($oldLogoPath)) {
                        Storage::disk('public')->delete($oldLogoPath);
                    }
                }
                // Lưu logo mới.
                $imagePath = $request->file('logo')->store('logos', 'public');
                $validated['logo'] = '/storage/' . $imagePath;
            } elseif (array_key_exists('logo', $request->all()) && $request->input('logo') === null) {
                // Nếu người dùng muốn xóa logo (logo = null).
                if ($company->logo) {
                    $oldLogoPath = str_replace('/storage/', '', $company->logo);
                    if (Storage::disk('public')->exists($oldLogoPath)) {
                        Storage::disk('public')->delete($oldLogoPath);
                    }
                }
                $validated['logo'] = null;
            } else {
                // Nếu không có file mới và không có yêu cầu xóa, giữ nguyên logo cũ.
                unset($validated['logo']);
            }

            $company->update($validated);

            return response()->json(['success' => true, 'data' => $company], 200);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi khi cập nhật hãng', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Xóa một hãng vận tải.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $company = TransportCompany::findOrFail($id);
            // Xóa logo cũ nếu có trước khi xóa bản ghi.
            if ($company->logo) {
                $oldLogoPath = str_replace('/storage/', '', $company->logo);
                if (Storage::disk('public')->exists($oldLogoPath)) {
                    Storage::disk('public')->delete($oldLogoPath);
                }
            }
            $company->delete();

            return response()->json(['success' => true, 'message' => 'Đã xoá hãng thành công.'], 200);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi khi xoá hãng', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Hàm dùng chung để validate dữ liệu từ request.
     */
    private function validateCompany(Request $request): array
    {
        $data = $request->all();

        // Xử lý các trường JSON: nếu là chuỗi, decode thành mảng.
        if (isset($data['operating_hours']) && is_string($data['operating_hours'])) {
            $data['operating_hours'] = json_decode($data['operating_hours'], true);
        }
        if (isset($data['price_range']) && is_string($data['price_range'])) {
            $data['price_range'] = json_decode($data['price_range'], true);
        }
        if (isset($data['payment_methods']) && is_string($data['payment_methods'])) {
            $data['payment_methods'] = json_decode($data['payment_methods'], true);
        }

        // Xử lý trường has_mobile_app: chuyển chuỗi 'true'/'false'/'0'/'1' thành boolean.
        if (isset($data['has_mobile_app'])) {
            $data['has_mobile_app'] = filter_var($data['has_mobile_app'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }

        $validator = Validator::make($data, [
            'transportation_id' => 'required|integer|exists:transportations,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'operating_hours' => 'nullable|array',
            'price_range' => 'nullable|array',
            'payment_methods' => 'nullable|array',
            'phone_number' => 'nullable|string|max:50',
            'email' => 'nullable|email',
            'website' => 'nullable|url',
            'has_mobile_app' => 'boolean',
            'status' => 'nullable|in:active,inactive,draft',
        ]);

        return $validator->validate();
    }
}
