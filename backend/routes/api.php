<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TransportCompanyController;
use App\Http\Controllers\Api\TransportationsController;
use App\Http\Controllers\Api\CheckinPlaceController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\DishController;
use App\Http\Controllers\Api\RestaurantController;


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

// Lấy danh sách gợi ý loại phương tiện (giới hạn 6)





/*
|--------------------------------------------------------------------------
| 📍 API - ĐỊA ĐIỂM CHECK-IN (checkin_places)
|--------------------------------------------------------------------------
*/

// Lấy danh sách tất cả địa điểm check-in
Route::get('/checkin-places', [CheckinPlaceController::class, 'index']);

// Lấy chi tiết một địa điểm theo ID
Route::get('/checkin-places/{id}', [CheckinPlaceController::class, 'show']);

// Tạo mới một địa điểm check-in
Route::post('/checkin-places', [CheckinPlaceController::class, 'store']);

// Cập nhật địa điểm check-in
Route::put('/checkin-places/{id}', [CheckinPlaceController::class, 'update']);

// Xóa địa điểm check-in
Route::delete('/checkin-places/{id}', [CheckinPlaceController::class, 'destroy']);

// Người dùng gửi ảnh check-in
Route::post('/checkin-places/checkin', [CheckinPlaceController::class, 'checkin']); // ✅ giữ lại đúng hàm

// Xóa ảnh check-in (của user hoặc admin)
Route::delete('/checkin-photos/{photoId}', [CheckinPlaceController::class, 'deleteCheckinPhoto']);



/*
|--------------------------------------------------------------------------
| 🏨 🍜 🍴 API - ĐỀ XUẤT GỢI Ý (hotel, dish, restaurant)
|--------------------------------------------------------------------------
*/

// Lấy danh sách khách sạn gợi ý
Route::get('/hotels/suggested', [HotelController::class, 'getSuggested']);

// Lấy danh sách món ăn gợi ý
Route::get('/dishes/suggested', [DishController::class, 'getSuggested']);

// Lấy danh sách nhà hàng gợi ý
Route::get('/restaurants/suggested', [RestaurantController::class, 'getSuggested']);
