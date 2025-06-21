<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TransportCompanyController;
use App\Http\Controllers\Api\CheckinPlaceController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\DishController;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\TransportationsController;
// =======================
// 📦 ROUTES - HÃNG VẬN CHUYỂN
// =======================

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


// =======================
// 📍 ROUTES - ĐỊA ĐIỂM CHECK-IN
// =======================

// Lấy danh sách tất cả địa điểm check-in
Route::get('/checkin-places', [CheckinPlaceController::class, 'index']);

// Lấy chi tiết một địa điểm theo ID
Route::get('/checkin-places/{id}', [CheckinPlaceController::class, 'show']);

// Tạo mới một địa điểm check-in
Route::post('/checkin-places', [CheckinPlaceController::class, 'store']);

// Cập nhật địa điểm check-in theo ID
Route::put('/checkin-places/{id}', [CheckinPlaceController::class, 'update']);

// Xóa địa điểm check-in theo ID
Route::delete('/checkin-places/{id}', [CheckinPlaceController::class, 'destroy']);
Route::get('/hotels/suggested', [HotelController::class, 'getSuggested']);
Route::get('/dishes/suggested', [DishController::class, 'getSuggested']);
Route::get('/restaurants/suggested', [RestaurantController::class, 'getSuggested']);
Route::get('/transportations/suggested', [TransportationsController::class, 'getSuggested']);




