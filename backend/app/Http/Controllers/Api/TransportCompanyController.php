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
            // Validate dữ liệu. Hàm validateCompany đã được sửa để xử lý JSON và boolean
            $validated = $this->validateCompany($request);

            // Xử lý lưu logo sau khi validate thành công
            if ($request->hasFile('logo')) {
                $imagePath = $request->file('logo')->store('logos', 'public'); // Lưu vào storage/app/public/logos
                $validated['logo'] = '/storage/' . $imagePath; // Lưu đường dẫn công khai
            } else {
                // Nếu không có file logo được gửi, đảm bảo trường logo là null
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

    // ✏️ Cập nhật hãng
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $company = TransportCompany::findOrFail($id);
            $validated = $this->validateCompany($request);

            // Xử lý lưu logo khi update
            if ($request->hasFile('logo')) {
                // Xóa logo cũ nếu có và tồn tại
                if ($company->logo) {
                    $oldLogoPath = str_replace('/storage/', '', $company->logo);
                    if (Storage::disk('public')->exists($oldLogoPath)) {
                        Storage::disk('public')->delete($oldLogoPath);
                    }
                }
                $imagePath = $request->file('logo')->store('logos', 'public');
                $validated['logo'] = '/storage/' . $imagePath;
            } elseif (array_key_exists('logo', $request->all()) && $request->input('logo') === null) {
                // Nếu frontend gửi trường 'logo' là null (người dùng muốn xóa logo)
                if ($company->logo) {
                    $oldLogoPath = str_replace('/storage/', '', $company->logo);
                    if (Storage::disk('public')->exists($oldLogoPath)) {
                        Storage::disk('public')->delete($oldLogoPath);
                    }
                }
                $validated['logo'] = null; // Set logo to null in DB
            } else {
                // Nếu không có file mới được upload và không có yêu cầu xóa (logo=null)
                // Giữ nguyên logo cũ bằng cách không gán lại giá trị 'logo' trong $validated
                unset($validated['logo']); // Đảm bảo logo không bị ghi đè thành null nếu không có file mới
            }

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
            // Xóa logo cũ nếu có trước khi xóa bản ghi
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

    // ✅ Hàm validate dùng chung
    private function validateCompany(Request $request): array
    {
        // Lấy tất cả dữ liệu từ request
        $data = $request->all();

        // Xử lý các trường JSON: nếu là chuỗi, decode thành mảng
        if (isset($data['operating_hours']) && is_string($data['operating_hours'])) {
            $data['operating_hours'] = json_decode($data['operating_hours'], true);
        }
        if (isset($data['price_range']) && is_string($data['price_range'])) {
            $data['price_range'] = json_decode($data['price_range'], true);
        }
        if (isset($data['payment_methods']) && is_string($data['payment_methods'])) {
            $data['payment_methods'] = json_decode($data['payment_methods'], true);
        }
        if (isset($data['highlight_services']) && is_string($data['highlight_services'])) {
            $data['highlight_services'] = json_decode($data['highlight_services'], true);
        }

        // Xử lý trường has_mobile_app: chuyển chuỗi 'true'/'false'/'0'/'1' thành boolean
        if (isset($data['has_mobile_app'])) {
            // filter_var sẽ chuyển 'true', '1' thành true; 'false', '0' thành false.
            // Nếu không phải các giá trị này, nó sẽ trả về null.
            $data['has_mobile_app'] = filter_var($data['has_mobile_app'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }

        // Tạo Validator instance với dữ liệu đã xử lý
        $validator = Validator::make($data, [
            'transportation_id'       => 'required|integer|exists:transportations,id',
            'province_id'             => 'nullable|integer',
            'name'                    => 'required|string|max:255',
            'short_description'       => 'nullable|string|max:255',
            'description'             => 'nullable|string',
            'address'                 => 'required|string',
            'latitude'                => 'required|numeric',
            'longitude'               => 'required|numeric',
            'logo'                    => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Sửa rule cho logo để chấp nhận file ảnh
            'rating'                  => 'nullable|numeric|min:0|max:5',
            'price_range'             => 'nullable|array',
            'operating_hours'         => 'nullable|array',
            'payment_methods'         => 'nullable|array',
            'highlight_services'      => 'nullable|array',
            'contact_response_time'   => 'nullable|string|max:100',
            'phone_number'            => 'nullable|string|max:50',
            'email'                   => 'nullable|email',
            'website'                 => 'nullable|url',
            'has_mobile_app'          => 'boolean', // Rule 'boolean' hoạt động tốt sau khi filter_var
            'status'                  => 'nullable|in:active,inactive,draft',
        ]);

        // Trả về dữ liệu đã được xác thực (bao gồm cả dữ liệu đã được parse/chuyển đổi)
        return $validator->validate();
    }
}