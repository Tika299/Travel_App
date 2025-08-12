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
use App\Http\Controllers\Api\TransportationsController;
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

// Hotel Rooms Routes
Route::get('/hotel-rooms/{roomId}/amenities', [HotelRoomController::class, 'getAllRoomAmenities']);
Route::post('/rooms/{roomId}/amenities', [HotelRoomController::class, 'syncAmenities']);
Route::post('/hotel-rooms', [HotelRoomController::class, 'store']);
Route::get('/hotel-rooms/{id}', [HotelRoomController::class, 'show']);
Route::put('/hotel-rooms/{id}', [HotelRoomController::class, 'update']);
Route::get('/hotels/{id}/rooms', [HotelController::class, 'getRooms']);
Route::delete('/hotel-rooms/{id}', [HotelRoomController::class, 'destroy']);

// Amenities Routes
Route::get('/amenities', [AmenitiesController::class, 'index']);
Route::post('/amenities', [AmenitiesController::class, 'store']);
Route::get('/amenities/by-room/{roomId}', [AmenitiesController::class, 'getByRoom']);

/*
|--------------------------------------------------------------------------
| 📍 Authentication Routes
|--------------------------------------------------------------------------
*/

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

    // User Management
    Route::get('/user', [UserController::class, 'getUserInfo']);
    Route::put('/user/{id}', [UserController::class, 'update']);
    Route::post('/user/avatar', [UserController::class, 'updateAvatar']);
    Route::get('/me', function (Request $request) {
        return response()->json($request->user());
    });

    // Đăng xuất
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Đăng xuất thành công']);
    });

    // Favourites Management
    Route::get('/favourites', [FavouriteController::class, 'index']);
    Route::post('/favourites', [FavouriteController::class, 'store']);
    Route::get('/favourites/counts', [FavouriteController::class, 'counts']);
    Route::post('/favourites/check-status', [FavouriteController::class, 'checkStatus']);
    Route::delete('/favourites/{id}', [FavouriteController::class, 'destroy']);
    Route::put('/favourites/{id}', [FavouriteController::class, 'update']);

    // Review Management
    Route::post('reviews', [ReviewController::class, 'store']);
    Route::put('reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('reviews/{id}', [ReviewController::class, 'destroy']);
    Route::get('my-reviews', [ReviewController::class, 'getMyReviews']);
    Route::get('review/{id}', [ReviewController::class, 'show']);

    // Review Images
    Route::get('/reviews/{reviewId}/images', [ReviewImageController::class, 'index']);
    Route::post('/reviews/{reviewId}/images', [ReviewImageController::class, 'store']);
    Route::delete('/review-images/{id}', [ReviewImageController::class, 'destroy']);

    // Like System
    Route::post('/reviews/{reviewId}/like', [LikeController::class, 'toggle']);
    Route::get('/reviews/{reviewId}/like-count', [LikeController::class, 'count']);

    // Comments
    Route::get('/reviews/{review}/comments', [CommentController::class, 'index']);
    Route::post('/reviews/{review}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{id}', [CommentController::class, 'update']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

    // Schedule Management
    Route::apiResource('schedules', ScheduleController::class);
    Route::post('/ai-suggest-schedule', [ScheduleController::class, 'aiSuggestSchedule']);

    // Event Management
    Route::post('/events', [ScheduleController::class, 'storeEvent']);
    Route::get('/events', [ScheduleController::class, 'getUserEvents']);
    Route::put('/events/{id}', [ScheduleController::class, 'updateEvent']);
    Route::put('/events/{id}/info', [ScheduleController::class, 'updateEventInfo']);
    Route::delete('/events/{id}', [ScheduleController::class, 'deleteEvent']);
    Route::post('/events/{id}/share', [ScheduleController::class, 'shareEvent']);

    // AI Travel Planning
    Route::post('/ai/generate-itinerary', [AITravelController::class, 'generateItinerary']);
    Route::post('/ai/save-itinerary', [AITravelController::class, 'saveItineraryFromAI']);
    Route::get('/ai/upgrade-info', [AITravelController::class, 'getUpgradeInfo']);
    Route::get('/ai/itinerary/{scheduleId}', [AITravelController::class, 'getItineraryDetail']);
    Route::put('/ai/events/{eventId}', [AITravelController::class, 'updateItineraryEvent']);
    Route::delete('/ai/events/{eventId}', [AITravelController::class, 'deleteItineraryEvent']);

    // Admin Routes
    Route::middleware('isAdmin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/stats', [UserController::class, 'stats']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::post('/users/delete-multiple', [UserController::class, 'deleteMultiple']);
        Route::put('/users/{id}', [UserController::class, 'updateAdmin']);
        Route::post('/users/{id}/avatar', [UserController::class, 'updateAvatarByAdmin']);
        Route::post('/users', [UserController::class, 'store']);
    });
});

/*
|--------------------------------------------------------------------------
| 🌐 Public API Resources
|--------------------------------------------------------------------------
*/

// Public Reviews
Route::get('reviews', [ReviewController::class, 'index']);

// API Resources
Route::apiResource('checkin-places', CheckinPlaceController::class);
Route::apiResource('transport-companies', TransportCompanyController::class);
Route::apiResource('restaurants', RestaurantController::class);
Route::apiResource('locations', LocationController::class);
Route::apiResource('cuisines', CuisineController::class);
Route::apiResource('categories', CategoryController::class);

// Transportations Routes
Route::get('/transportations', [TransportationsController::class, 'index']);
Route::post('/transportations', [TransportationsController::class, 'store']);
Route::get('/transportations/{id}', [TransportationsController::class, 'show']);
Route::put('/transportations/{id}', [TransportationsController::class, 'update']);
Route::delete('/transportations/{id}', [TransportationsController::class, 'destroy']);

// Check-in Routes
Route::post('/checkin-places/checkin', [CheckinPlaceController::class, 'checkin']);
Route::delete('/checkin-photos/{photoId}', [CheckinPlaceController::class, 'deleteCheckinPhoto']);

// Reviews for different entities
Route::get('/restaurants/{id}/reviews', [ReviewController::class, 'index']);
Route::get('/restaurants/{id}/reviews/stats', [ReviewController::class, 'getStats']);
Route::get('/checkin-places/{id}/reviews', [CheckinPlaceController::class, 'getPlaceReviews']);
Route::get('/transport-companies/{id}/reviews', [TransportCompanyController::class, 'getCompanyReviews']);

// Restaurant specific routes
Route::get('/restaurants/{id}/dishes', [DishesController::class, 'getDishesByRestaurant']);

// Schedule Items Routes
Route::apiResource('schedule-items', ScheduleItemController::class);
Route::get('/schedule-items/by-date', [ScheduleItemController::class, 'getByDate']);
Route::get('/schedule-items/by-date-range', [ScheduleItemController::class, 'getByDateRange']);

// Schedule Details Routes
Route::apiResource('schedule-details', ScheduleDetailController::class);
Route::get('/schedule-details/by-type', [ScheduleDetailController::class, 'getByType']);
Route::get('/schedule-details/by-status', [ScheduleDetailController::class, 'getByStatus']);

// Google Places
Route::get('/google-places', [\App\Http\Controllers\Api\GooglePlacesController::class, 'search']);
Route::get('/vietnamese-provinces', [\App\Http\Controllers\Api\GooglePlacesController::class, 'getVietnameseProvinces']);

// Featured Activities
Route::get('/featured-activities', [FeaturedActivitiesController::class, 'getFeaturedActivities']);

// Default Schedule
Route::get('/schedules/default', [ScheduleController::class, 'getOrCreateDefault']);

/*
|--------------------------------------------------------------------------
| 🧪 Test Routes
|--------------------------------------------------------------------------
*/



