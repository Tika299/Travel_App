<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage; // Import Storage facade

class HotelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // Lấy danh sách tất cả khách sạn (Read - Index)
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 10); // Mặc định 10 mục mỗi trang
        $hotels = Hotel::with(['rooms' => function ($query) {
            $query->orderBy('price_per_night', 'asc')->take(1);
        }])->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $hotels->items(),
            'current_page' => $hotels->currentPage(),
            'last_page' => $hotels->lastPage(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Log request để kiểm tra dữ liệu nhận được
        Log::info('Hotel create request', $request->all());

        // Validate dữ liệu đầu vào
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:hotels,name',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'images' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Bắt buộc là file ảnh khi tạo mới
            'rating' => 'nullable|numeric|min:0|max:5',
            'review_count' => 'nullable|integer|min:0',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:15',
            'wheelchair_access' => 'nullable|boolean',
        ]);

        $imagePath = null;
        if ($request->hasFile('images')) {
            $image = $request->file('images');
            // Tạo tên file duy nhất và di chuyển vào thư mục public/img
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('storage/uploads/hotels'), $imageName);
            $imagePath = 'storage/uploads/hotels/' . $imageName; // Lưu đường dẫn tương đối
        }

        $hotel = Hotel::create([
            'name' => $validatedData['name'],
            'description' => $validatedData['description'] ?? null,
            'address' => $validatedData['address'],
            'latitude' => $validatedData['latitude'],
            'longitude' => $validatedData['longitude'],
            'images' => $imagePath, // Lưu đường dẫn ảnh
            'rating' => $validatedData['rating'] ?? null,
            'review_count' => $validatedData['review_count'] ?? 0,
            'email' => $validatedData['email'] ?? null,
            'phone' => $validatedData['phone'],
            'wheelchair_access' => $validatedData['wheelchair_access'] ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hotel created successfully!',
            'data' => $hotel,
        ], 201);
    }

    /**
     * Display the specified hotel with its rooms and reviews.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        // Eager load 'rooms' và 'reviews' để tránh N+1 query
        $hotel = Hotel::with([
            'rooms' => function ($query) {
                $query->with('amenityList')->orderBy('price_per_night', 'asc');
            },
            'reviews' => function ($query) {
                $query->with('user')->orderBy('created_at', 'desc')->limit(10);
            }
        ])->find($id);

        if (!$hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Khách sạn không tồn tại'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'hotel' => $hotel,
                'rooms' => $hotel->rooms,
                'reviews' => $hotel->reviews,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        // Log request để kiểm tra dữ liệu nhận được
        Log::info('Hotel update request', $request->all());

        $hotel = Hotel::findOrFail($id);

        // Validation cho update
        // images là nullable vì có thể không update ảnh, hoặc update bằng đường dẫn
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:hotels,name,' . $id, // unique ngoại trừ chính nó
            'description' => 'nullable|string',
            'address' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'images' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Hoặc 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
            // Nếu frontend gửi file, Laravel sẽ coi nó là file.
            // Nếu frontend gửi string, Laravel sẽ coi nó là string.
            // Ta sẽ xử lý riêng bên dưới.
            'rating' => 'nullable|numeric|min:0|max:5',
            'review_count' => 'nullable|integer|min:0',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:15',
            'wheelchair_access' => 'nullable|boolean',
        ]);

        // Cập nhật các trường dữ liệu
        $hotel->update([
            'name' => $validatedData['name'],
            'description' => $validatedData['description'] ?? null,
            'address' => $validatedData['address'],
            'latitude' => $validatedData['latitude'],
            'longitude' => $validatedData['longitude'],
            'rating' => $validatedData['rating'] ?? null,
            'review_count' => $validatedData['review_count'] ?? 0,
            'email' => $validatedData['email'] ?? null,
            'phone' => $validatedData['phone'],
            'wheelchair_access' => $validatedData['wheelchair_access'] ?? false,
        ]);

        // Xử lý upload ảnh (nếu có file mới)
        if ($request->hasFile('images')) {
            // Xóa ảnh cũ nếu có và tồn tại
            if ($hotel->images && Storage::disk('public')->exists($hotel->images)) {
                Storage::disk('public')->delete($hotel->images);
            }

            $image = $request->file('images');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('storage/uploads/hotels'), $imageName);
            $hotel->images = 'storage/uploads/hotels/' . $imageName; // Lưu đường dẫn tương đối
            $hotel->save(); // Lưu lại model để cập nhật trường images
        } else if ($request->has('images') && !empty($request->input('images'))) {
            // Nếu không có file mới được tải lên, nhưng có đường dẫn ảnh được gửi từ frontend
            // Và đường dẫn này khác với đường dẫn hiện tại trong DB, thì cập nhật.
            // Điều này xảy ra khi người dùng không tải file mới mà chỉ muốn sửa đường dẫn hoặc giữ nguyên.
            if ($hotel->images !== $request->input('images')) {
                // Tùy chọn: Xóa ảnh cũ nếu đường dẫn cũ khác đường dẫn mới
                // if ($hotel->images && Storage::disk('public')->exists($hotel->images)) {
                //     Storage::disk('public')->delete($hotel->images);
                // }
                $hotel->images = $request->input('images');
                $hotel->save();
            }
        } else if ($request->has('images') && empty($request->input('images'))) {
            // Trường hợp frontend gửi 'images' rỗng, có thể hiểu là muốn xóa ảnh
            if ($hotel->images && Storage::disk('public')->exists($hotel->images)) {
                Storage::disk('public')->delete($hotel->images);
            }
            $hotel->images = null;
            $hotel->save();
        }


        // Bắt buộc gọi refresh để tránh trả về dữ liệu cũ trong cache
        $hotel->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Hotel updated successfully!',
            'data' => $hotel,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        $hotel = Hotel::findOrFail($id);
        // Tùy chọn: Xóa file ảnh liên quan khi xóa khách sạn
        if ($hotel->images && Storage::disk('public')->exists($hotel->images)) {
            Storage::disk('public')->delete($hotel->images);
        }
        $hotel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hotel deleted successfully!',
        ]);
    }

    // Lấy danh sách khách sạn đề xuất
    public function getSuggested(): JsonResponse
    {
        $hotels = Hotel::limit(6)->get();

        return response()->json(['success' => true, 'data' => $hotels]);
    }

    // Lấy danh sách khách sạn phổ biến
    public function getPopularHotels(): JsonResponse
    {
        $hotels = Hotel::with(['rooms' => function ($query) {
            $query->orderBy('price_per_night', 'asc')->take(1);
        }])
            ->orderByDesc('rating')
            // ->orderByDesc('review_count')
            ->limit(4)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $hotels,
        ]);
    }

    public function getRooms(int $id)
    {
        $hotel = Hotel::find($id);

        if (!$hotel) {
            return response()->json(['message' => 'Không tìm thấy khách sạn'], 404);
        }

        return response()->json(['data' => $hotel->rooms]);
    }
}
