<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CheckinPlaceController;
use App\Http\Controllers\Api\TransportCompanyController;
use App\Http\Controllers\Api\DishesController;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ItinerariesController;
use App\Http\Controllers\Api\LocationController;

use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\LoginController;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ForgotPasswordController;


/*
|--------------------------------------------------------------------------
| 📍 API - ĐỊA ĐIỂM CHECK-IN (checkin_places)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Thêm API resource cho checkin places
Route::apiResource('checkin-places', CheckinPlaceController::class);
Route::apiResource('transport-companies', TransportCompanyController::class);

// Thêm API Dishes(vanvu)
Route::apiResource('dishes',DishesController::class);
// Thêm API Restaurant(vanvu)
Route::apiResource('Restaurant', RestaurantController::class);

Route::apiResource('itineraries', ItinerariesController::class);
Route::apiResource('Location', LocationController::class);




Route::get('/Restaurant/{id}/reviews', [ReviewController::class, 'index']);
Route::get('/Restaurant/{id}/reviews/stats', [ReviewController::class, 'getStats']);
Route::post('/Restaurant/{id}/reviews', [ReviewController::class, 'store']);

Route::get('/Restaurant/{id}/dishes', [DishesController::class, 'getByRestaurant']);


// Thêm api cho xác thực otp khi đăng ký 
Route::post('/send-code', [VerificationController::class, 'sendCode']);
Route::post('/verify-code', [VerificationController::class, 'verifyCode']);

// Đăng nhập
Route::post('/login', [LoginController::class, 'login']);

// 🔐 Các route bảo vệ bởi Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Đăng xuất (Xóa token hiện tại)
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Đăng xuất thành công']);
    });

    // Lấy thông tin người dùng hiện tại
    Route::get('/me', function (Request $request) {
        return response()->json($request->user());
    });

    // Bạn có thể thêm các API cần bảo mật khác tại đây...
});
//quên mật khẩu 
// Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
// Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);


Route::post('/send-reset-code', [ForgotPasswordController::class, 'sendResetCode']);
// routes/api.php
Route::post('/verify-reset-code', [ForgotPasswordController::class, 'verifyCode']);

Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);
