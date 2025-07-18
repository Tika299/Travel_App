<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TransportCompanyController;
use App\Http\Controllers\Api\TransportationsController;
use App\Http\Controllers\Api\CheckinPlaceController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\DishController;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\FavouriteController;
use App\Http\Controllers\Api\CuisineController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ScheduleController;

/*
|--------------------------------------------------------------------------
| 📦 API - HÃNG VẬN CHUYỂN (transport_companies)
|--------------------------------------------------------------------------
*/

// Lấy danh sách tất cả hãng vận chuyển
Route::get('/transport-companies', [TransportCompanyController::class, 'index']);

// Lấy chi tiết một hãng vận chuyển theo ID
Route::get('/transport-companies/{id}', [TransportCompanyController::class, 'show']);

// Tạo mới một hãng vận chuyển
Route::post('/transport-companies', [TransportCompanyController::class, 'store']);

// Cập nhật hãng vận chuyển theo ID
Route::put('/transport-companies/{id}', [TransportCompanyController::class, 'update']);

// Xóa hãng vận chuyển theo ID
Route::delete('/transport-companies/{id}', [TransportCompanyController::class, 'destroy']);


/*
|--------------------------------------------------------------------------
| 🚗 API - LOẠI PHƯƠNG TIỆN (transportations)
|--------------------------------------------------------------------------
*/
Route::get('/transportations/suggested', [TransportationsController::class, 'getSuggested']);

// Lấy danh sách tất cả loại phương tiện
Route::get('/transportations', [TransportationsController::class, 'index']);

// Lấy chi tiết một loại phương tiện
Route::get('/transportations/{id}', [TransportationsController::class, 'show']);

// Tạo mới một loại phương tiện
Route::post('/transportations', [TransportationsController::class, 'store']);

// Cập nhật loại phương tiện
Route::put('/transportations/{id}', [TransportationsController::class, 'update']);

// Xóa loại phương tiện
Route::delete('/transportations/{id}', [TransportationsController::class, 'destroy']);


/*
|--------------------------------------------------------------------------
| 📍 API - ĐỊA ĐIỂM CHECK-IN (checkin_places)
|--------------------------------------------------------------------------
*/

// ✅ QUAN TRỌNG: ĐẶT CÁC ROUTE CỤ THỂ HOẶC CÓ TIỀN TỐ DÀI HƠN LÊN TRƯỚC
// Ví dụ: /checkin-places/all phải đứng trước /checkin-places/{id}

// Lấy danh sách tất cả địa điểm check-in (sử dụng /all)
// Route này phải đứng trước Route::get('/checkin-places/{id}'
Route::get('/checkin-places/all', [CheckinPlaceController::class, 'index']); // Đã sửa để trỏ tới index()

// Route thống kê cũng nên đứng trước route động
Route::get('/checkin-places/statistics', [CheckinPlaceController::class, 'getStatistics']);

// Lấy đánh giá cho một địa điểm check-in cụ thể
Route::get('checkin-places/{id}/reviews', [CheckinPlaceController::class, 'getPlaceReviews']);

// Lấy danh sách tất cả địa điểm check-in (route gốc)
Route::get('/checkin-places', [CheckinPlaceController::class, 'index']);

// Lấy chi tiết một địa điểm theo ID (route động)
Route::get('/checkin-places/{id}', [CheckinPlaceController::class, 'show']);

// Tạo mới một địa điểm check-in
Route::post('/checkin-places', [CheckinPlaceController::class, 'store']);

// Cập nhật địa điểm check-in
Route::put('/checkin-places/{id}', [CheckinPlaceController::class, 'update']);

// Xóa địa điểm check-in
Route::delete('/checkin-places/{id}', [CheckinPlaceController::class, 'destroy']);

// Người dùng gửi ảnh check-in
Route::post('/checkin-places/checkin', [CheckinPlaceController::class, 'checkin']);

// Xóa ảnh check-in (của user hoặc admin)
Route::delete('/checkin-photos/{photoId}', [CheckinPlaceController::class, 'deleteCheckinPhoto']);


// Lấy danh sách đánh giá cho một hãng vận chuyển cụ thể
Route::get('transport-companies/{id}/reviews', [TransportCompanyController::class, 'getCompanyReviews']);


/*
|--------------------------------------------------------------------------
| ⭐️ API - ĐÁNH GIÁ (reviews)
|--------------------------------------------------------------------------
*/

// Tạo mới một đánh giá (Review)
Route::post('/reviews', [ReviewController::class, 'store'])->middleware('auth:sanctum');

// Lấy danh sách review gợi ý (route này đã có)
Route::get('/reviews/suggested', [ReviewController::class, 'getSuggested']);


/*
|--------------------------------------------------------------------------
| 🏨 🍜 🍴 API - ĐỀ XUẤT GỢI Ý (hotel, dish, restaurant) - CÓ THỂ ĐẶT CHUNG GROUP
|--------------------------------------------------------------------------
*/

// Lấy danh sách khách sạn gợi ý
Route::get('/hotels/suggested', [HotelController::class, 'getSuggested']);

// Lấy danh sách món ăn gợi ý
Route::get('/dishes/suggested', [DishController::class, 'getSuggested']);

// Lấy danh sách nhà hàng gợi ý
Route::get('/restaurants/suggested', [RestaurantController::class, 'getSuggested']);

Route::get('/locations', [LocationController::class, 'index']);

Route::get('/favourites', [FavouriteController::class, 'index']);

Route::apiResource('cuisines', CuisineController::class);

Route::apiResource('categories', CategoryController::class);

// Lấy danh sách địa điểm check-in đề xuất
Route::get('/places/popular', [CheckinPlaceController::class, 'getPopularPlaces']);
Route::get('/hotels/popular', [HotelController::class, 'getPopularHotels']);

Route::apiResource('schedules', ScheduleController::class);