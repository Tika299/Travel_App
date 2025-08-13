<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransportCompany;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Exception;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\TransportCompaniesImport;

class TransportCompanyController extends Controller
{
    /**
     * Lấy danh sách các hãng vận tải.
     */
    public function index(): JsonResponse
    {
        try {
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
            $validated = $this->validateCompany($request);
            if ($request->hasFile('logo')) {
                $imagePath = $request->file('logo')->store('logos', 'public');
                $validated['logo'] = '/storage/' . $imagePath;
            } else {
                $validated['logo'] = null;
            }
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
            if ($request->hasFile('logo')) {
                if ($company->logo) {
                    $oldLogoPath = str_replace('/storage/', '', $company->logo);
                    if (Storage::disk('public')->exists($oldLogoPath)) {
                        Storage::disk('public')->delete($oldLogoPath);
                    }
                }
                $imagePath = $request->file('logo')->store('logos', 'public');
                $validated['logo'] = '/storage/' . $imagePath;
            } elseif (array_key_exists('logo', $request->all()) && $request->input('logo') === null) {
                if ($company->logo) {
                    $oldLogoPath = str_replace('/storage/', '', $company->logo);
                    if (Storage::disk('public')->exists($oldLogoPath)) {
                        Storage::disk('public')->delete($oldLogoPath);
                    }
                }
                $validated['logo'] = null;
            } else {
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
     * Import dữ liệu công ty vận tải từ file Excel (.xlsx) hoặc CSV.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function import(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:xlsx,xls,csv|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'File không hợp lệ. Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV dưới 2MB.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();
            // Lấy sheet đầu tiên từ file và import
            Excel::import(new TransportCompaniesImport, $request->file('file'));
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Import dữ liệu công ty vận tải thành công!',
            ], 201);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            DB::rollBack();
            $failures = $e->failures();
            $errors = [];
            foreach ($failures as $failure) {
                $errors[] = "Lỗi tại dòng " . $failure->row() . ": " . implode(', ', $failure->errors());
            }
            Log::error('Lỗi validation khi import: ' . implode(' | ', $errors));

            return response()->json([
                'success' => false,
                'message' => 'Có lỗi validation trong file dữ liệu. Vui lòng kiểm tra lại.',
                'errors' => $errors,
            ], 400);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi server khi import: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                // Trả về message lỗi chi tiết hơn từ exception
                'message' => 'Lỗi server khi import dữ liệu: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Hàm dùng chung để validate dữ liệu từ request.
     */
    private function validateCompany(Request $request): array
    {
        $data = $request->all();
        if (isset($data['operating_hours']) && is_string($data['operating_hours'])) {
            $data['operating_hours'] = json_decode($data['operating_hours'], true);
        }
        if (isset($data['price_range']) && is_string($data['price_range'])) {
            $data['price_range'] = json_decode($data['price_range'], true);
        }
        if (isset($data['payment_methods']) && is_string($data['payment_methods'])) {
            $data['payment_methods'] = json_decode($data['payment_methods'], true);
        }
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
