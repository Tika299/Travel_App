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
use App\Http\Controllers\Api\ScheduleItemController;
use App\Http\Controllers\Api\ScheduleDetailController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\DishesController;
use App\Http\Controllers\AmenitiesController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\FeaturedActivitiesController;
use App\Http\Controllers\Api\AITravelController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\GooglePlacesController;

use App\Http\Controllers\TransportCompanyImportController;

Route::post('/transport-companies/import', [TransportCompanyImportController::class, 'import']);


use App\Http\Controllers\CheckinPlaceImportController;

Route::post('/checkin-places/import', [CheckinPlaceImportController::class, 'import']);
/*
|--------------------------------------------------------------------------
| 🏨 🍜 🍴 Suggested and Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/checkin-places/statistics', [CheckinPlaceController::class, 'getStatistics']);
Route::get('/checkin-places/popular', [CheckinPlaceController::class, 'getPopularPlaces']);
Route::get('/hotels/popular', [HotelController::class, 'getPopularHotels']);
Route::get('/hotels/suggested', [HotelController::class, 'getSuggested']);
Route::post('/cuisines/import', [CuisineController::class, 'importCuisines'])->name('cuisines.import');
Route::post('/categories/import', [CategoryController::class, 'importCategories'])->name('categories.import');
Route::get('/cuisines/latest', [CuisineController::class, 'getLatestCuisines']);
Route::get('/cuisines/stats', [CuisineController::class, 'getStats']);
Route::get('/restaurants/suggested', [RestaurantController::class, 'getSuggested']);
Route::get('/reviews/suggested', [ReviewController::class, 'getSuggested']);
Route::get('/transportations/suggested', [TransportationsController::class, 'getSuggested']);

// Import Routes

Route::post('/restaurants/import', [RestaurantController::class, 'importRestaurants'])->name('restaurants.import');


Route::post('/amenities/import', [AmenitiesController::class, 'importAmenities'])->name('amenities.import');
Route::post('/dishes/import', [DishesController::class, 'importDishes'])->name('dishes.import');

// Hotel Routes
Route::post('/hotels/import', [HotelController::class, 'importHotels'])->name('hotels.import');
Route::post('/hotel-rooms/import', [HotelRoomController::class, 'importHotelRooms'])->name('hotel-rooms.import');
Route::get('/hotels', [HotelController::class, 'index']);
Route::post('/hotels', [HotelController::class, 'store']);
Route::get('/hotels/{id}', [HotelController::class, 'show']);
Route::put('/hotels/{id}', [HotelController::class, 'update']);
Route::delete('/hotels/{id}', [HotelController::class, 'destroy']);

// Restaurant Routes
Route::get('/restaurants/count', [RestaurantController::class, 'getCount']);
Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::post('/restaurants', [RestaurantController::class, 'store']);
Route::get('/restaurants/{id}', [RestaurantController::class, 'show']);
Route::put('/restaurants/{id}', [RestaurantController::class, 'update']);
Route::delete('/restaurants/{id}', [RestaurantController::class, 'destroy']);

// Checkin Places Routes
Route::get('/checkin-places', [CheckinPlaceController::class, 'index']);
Route::post('/checkin-places', [CheckinPlaceController::class, 'store']);
Route::put('/checkin-places/{id}', [CheckinPlaceController::class, 'update']);
Route::delete('/checkin-places/{id}', [CheckinPlaceController::class, 'destroy']);
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
    Route::post('/favourites/check-status', [FavouriteController::class, 'checkStatus']);
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
Route::post('/ai-suggest-schedule', [\App\Http\Controllers\Api\ScheduleController::class, 'aiSuggestSchedule']);

// Schedule Items Routes (không yêu cầu đăng nhập tạm thời)
Route::apiResource('schedule-items', ScheduleItemController::class);
Route::get('/schedule-items/by-date', [ScheduleItemController::class, 'getByDate']);
Route::get('/schedule-items/by-date-range', [ScheduleItemController::class, 'getByDateRange']);

// Schedule Details Routes (không yêu cầu đăng nhập tạm thời)
Route::apiResource('schedule-details', ScheduleDetailController::class);
Route::get('/schedule-details/by-type', [ScheduleDetailController::class, 'getByType']);
Route::get('/schedule-details/by-status', [ScheduleDetailController::class, 'getByStatus']);

Route::get('/google-places', [\App\Http\Controllers\Api\GooglePlacesController::class, 'search']);
Route::get('/vietnamese-provinces', [\App\Http\Controllers\Api\GooglePlacesController::class, 'getVietnameseProvinces']);

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



Route::apiResource('schedules', ScheduleController::class);
Route::post('/ai-suggest-schedule', [\App\Http\Controllers\Api\ScheduleController::class, 'aiSuggestSchedule']);

// Event routes - cần authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/events', [ScheduleController::class, 'storeEvent']);
Route::get('/events', [ScheduleController::class, 'getUserEvents']);
Route::put('/events/{id}', [ScheduleController::class, 'updateEvent']);
Route::put('/events/{id}/info', [ScheduleController::class, 'updateEventInfo']);
Route::delete('/events/{id}', [ScheduleController::class, 'deleteEvent']);
Route::post('/events/{id}/share', [ScheduleController::class, 'shareEvent']);
Route::get('/featured-activities', [FeaturedActivitiesController::class, 'getFeaturedActivities']);

// AI Travel Planning Routes
Route::post('/ai/generate-itinerary', [AITravelController::class, 'generateItinerary']);
Route::post('/ai/save-itinerary', [AITravelController::class, 'saveItineraryFromAI']);
Route::get('/ai/upgrade-info', [AITravelController::class, 'getUpgradeInfo']);
Route::get('/ai/itinerary/{scheduleId}', [AITravelController::class, 'getItineraryDetail']);
Route::put('/ai/events/{eventId}', [AITravelController::class, 'updateItineraryEvent']);
Route::delete('/ai/events/{eventId}', [AITravelController::class, 'deleteItineraryEvent']);
    

});

// Test route để debug POST data
Route::post('/test-post', function (Request $request) {
    return response()->json([
        'message' => 'POST data received',
        'data' => $request->all(),
        'headers' => $request->headers->all()
    ]);
});
Route::get('/google-places', [\App\Http\Controllers\Api\GooglePlacesController::class, 'search']);



