<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\CheckinPlaceController;
use App\Http\Controllers\Api\TransportCompanyController;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\TransportationsController; // <-- Đảm bảo dòng này tồn tại
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\FavouriteController;
use App\Http\Controllers\Api\CuisineController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\HotelRoomController;
use App\Http\Controllers\Api\ReviewImageController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\DishesController;
use App\Http\Controllers\AmenitiesController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\LikeController;

/*
|--------------------------------------------------------------------------
| 🏨 🍜 🍴 Suggested and Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/checkin-places/statistics', [CheckinPlaceController::class, 'getStatistics']);
Route::get('/checkin-places/popular', [CheckinPlaceController::class, 'getPopularPlaces']);
Route::get('/hotels/popular', [HotelController::class, 'getPopularHotels']);
Route::get('/hotels/suggested', [HotelController::class, 'getSuggested']);
Route::get('/cuisines/latest', [CuisineController::class, 'getLatestCuisines']);
Route::get('/restaurants/suggested', [RestaurantController::class, 'getSuggested']);
Route::get('/reviews/suggested', [ReviewController::class, 'getSuggested']);
Route::get('/transportations/suggested', [TransportationsController::class, 'getSuggested']);


// Hotel Routes
Route::post('/hotels/import', [HotelController::class, 'importHotels'])->name('hotels.import');
Route::post('/hotel-rooms/import', [HotelRoomController::class, 'importHotelRooms'])->name('hotel-rooms.import');
Route::get('/hotels', [HotelController::class, 'index']);
Route::post('/hotels', [HotelController::class, 'store']);
Route::get('/hotels/{id}', [HotelController::class, 'show']);
Route::put('/hotels/{id}', [HotelController::class, 'update']);
Route::delete('/hotels/{id}', [HotelController::class, 'destroy']);
Route::get('/hotel-rooms/{roomId}/amenities', [HotelRoomController::class, 'getAllRoomAmenities']);
// Route để cập nhật tiện ích cho phòng
Route::post('/rooms/{roomId}/amenities', [App\Http\Controllers\HotelRoomController::class, 'syncAmenities']);
Route::post('/hotel-rooms', [HotelRoomController::class, 'store']);
Route::get('/hotel-rooms/{id}', [HotelRoomController::class, 'show']); // <-- THÊM DÒNG NÀY
Route::put('/hotel-rooms/{id}', [HotelRoomController::class, 'update']);
// Lấy danh sách phòng của một khách sạn
Route::get('/hotels/{id}/rooms', [HotelController::class, 'getRooms']);
// Thêm route để xóa phòng
Route::delete('/hotel-rooms/{id}', [HotelRoomController::class, 'destroy']);
// Route để lấy TẤT CẢ tiện ích
Route::get('/amenities', [AmenitiesController::class, 'index']);
Route::post('/amenities', [AmenitiesController::class, 'store']);
Route::get('/amenities/by-room/{roomId}', [AmenitiesController::class, 'getByRoom']);

/*
|--------------------------------------------------------------------------
| 📍 API Routes
|--------------------------------------------------------------------------
*/

// Lấy thông tin người dùng hiện tại
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Đăng nhập
Route::post('/login', [LoginController::class, 'login'])->name('login');

// Xác thực OTP khi đăng ký
Route::post('/send-code', [VerificationController::class, 'sendCode']);
Route::post('/verify-code', [VerificationController::class, 'verifyCode']);

// Quên mật khẩu
Route::post('/send-reset-code', [ForgotPasswordController::class, 'sendResetCode']);
Route::post('/verify-reset-code', [ForgotPasswordController::class, 'verifyCode']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| 🔐 Protected Routes (Yêu cầu xác thực)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', [UserController::class, 'getUserInfo']);

    // Lấy danh sách yêu thích
    Route::get('/favourites', [FavouriteController::class, 'index']);

    //Thêm favourite
    Route::post('/favourites', [FavouriteController::class, 'store']);
    Route::get('/favourites/counts', [FavouriteController::class, 'counts']);
    // Xoá favourite
    Route::delete('/favourites/{id}', [FavouriteController::class, 'destroy']);

    // Cập nhật favourite
    Route::put('/favourites/{id}', [FavouriteController::class, 'update']);


    // Đăng xuất
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Đăng xuất thành công']);
    });

    // Lấy thông tin người dùng hiện tại
    Route::get('/me', function (Request $request) {
        return response()->json($request->user());
    });
    // Review CRUD
    Route::post('reviews', [ReviewController::class, 'store']);
    Route::put('reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('reviews/{id}', [ReviewController::class, 'destroy']);
    Route::get('my-reviews', [ReviewController::class, 'getMyReviews']);
    Route::get('review/{id}', [ReviewController::class, 'show']);

    // Review image
    Route::get('/reviews/{reviewId}/images', [ReviewImageController::class, 'index']);
    Route::post('/reviews/{reviewId}/images', [ReviewImageController::class, 'store']);
    Route::delete('/review-images/{id}', [ReviewImageController::class, 'destroy']);

    // Like
    Route::post('/reviews/{reviewId}/like', [LikeController::class, 'toggle']);
    Route::get('/reviews/{reviewId}/like-count', [LikeController::class, 'count']);

    // Comment
    Route::get('/reviews/{review}/comments', [CommentController::class, 'index']);
    Route::post('/reviews/{review}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{id}', [CommentController::class, 'update']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
});

// ĐÚNG
Route::middleware('auth:sanctum')->put('/user/{id}', [UserController::class, 'update']);
Route::middleware('auth:sanctum')->post('/user/avatar', [UserController::class, 'updateAvatar']);

Route::get('reviews', [ReviewController::class, 'index']);


// API Resources (Giữ lại các resource khác nếu bạn đang dùng chúng)
Route::apiResource('checkin-places', CheckinPlaceController::class);
Route::apiResource('transport-companies', TransportCompanyController::class);
// Route::apiResource('transportations', TransportationsController::class); // <-- Dòng này đã được BỎ COMMENT HOẶC XÓA ĐI
Route::apiResource('Restaurant', RestaurantController::class);
Route::apiResource('locations', LocationController::class);
Route::apiResource('cuisines', CuisineController::class);
Route::apiResource('categories', CategoryController::class);

// THÊM CÁC ROUTE THỦ CÔNG CHO TRANSPORTATIONS Ở ĐÂY
Route::get('/transportations', [TransportationsController::class, 'index']);
Route::post('/transportations', [TransportationsController::class, 'store']);
Route::get('/transportations/{id}', [TransportationsController::class, 'show']);
Route::put('/transportations/{id}', [TransportationsController::class, 'update']);
Route::delete('/transportations/{id}', [TransportationsController::class, 'destroy']);


// Check-in Routes
Route::post('/checkin-places/checkin', [CheckinPlaceController::class, 'checkin']);
Route::delete('/checkin-photos/{photoId}', [CheckinPlaceController::class, 'deleteCheckinPhoto']);

Route::get('/Restaurant/{id}/reviews', [ReviewController::class, 'index']);
Route::get('/Restaurant/{id}/reviews/stats', [ReviewController::class, 'getStats']);
Route::get('/checkin-places/{id}/reviews', [CheckinPlaceController::class, 'getPlaceReviews']);
Route::get('/transport-companies/{id}/reviews', [TransportCompanyController::class, 'getCompanyReviews']);
Route::get('/checkin-places/{id}', [CheckinPlaceController::class, 'show'])->where('id', '[0-9]+');


// Lấy danh sách địa điểm check-in đề xuất
Route::get('/places/popular', [CheckinPlaceController::class, 'getPopularPlaces']);


Route::apiResource('schedules', ScheduleController::class);

//admin user 
Route::middleware(['auth:sanctum', 'isAdmin'])->get('/users', [UserController::class, 'index']);

Route::get('/users', [UserController::class, 'index']);
//hiển thị
Route::get('/users/stats', [UserController::class, 'stats']);

// xóa
Route::delete('/users/{id}', [UserController::class, 'destroy']);
Route::post('/users/delete-multiple', [UserController::class, 'deleteMultiple']);

// chỉnh sửa
Route::middleware('auth:sanctum')->put('/users/{id}', [UserController::class, 'updateAdmin']);
//ảnh
Route::middleware('auth:sanctum')->post('/users/{id}/avatar', [UserController::class, 'updateAvatarByAdmin']);

// thêm
Route::middleware('auth:sanctum')->post('/users', [UserController::class, 'store']);


// Thêm API Restaurant(vanvu)
Route::get('/Restaurant/show/{id}', [RestaurantController::class, 'show']);
Route::put('/Restaurant/{id}', [RestaurantController::class, 'update']);
Route::delete('/Restaurant/delete/{restaurant}', [RestaurantController::class, 'destroy']);
Route::get('/Restaurant/{id}/dishes', [DishesController::class, 'getDishesByRestaurant']);

Route::get('/Restaurant/{id}/reviews', [ReviewController::class, 'index']);
Route::get('/Restaurant/{id}/reviews/stats', [ReviewController::class, 'getStats']);
Route::post('/Restaurant/{id}/reviews', [ReviewController::class, 'store']);
