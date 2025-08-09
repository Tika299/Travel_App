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


    //Thêm favourite
    Route::post('/favourites', [FavouriteController::class, 'store']);
    // Lấy danh sách yêu thích
    Route::get('/favourites', [FavouriteController::class, 'index']);
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

// Event routes - cần authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/events', [ScheduleController::class, 'storeEvent']);
Route::get('/events', [ScheduleController::class, 'getUserEvents']);
Route::put('/events/{id}', [ScheduleController::class, 'updateEvent']);
Route::put('/events/{id}/info', [ScheduleController::class, 'updateEventInfo']);
Route::delete('/events/{id}', [ScheduleController::class, 'deleteEvent']);
Route::post('/events/{id}/share', [ScheduleController::class, 'shareEvent']);
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

// Test route để kiểm tra mock schedule
Route::get('/test-mock-schedule', function () {
    $controller = new \App\Http\Controllers\Api\ScheduleController();
    $places = [
        [
            'name' => 'Dinh Độc Lập',
            'type' => 'checkin_place',
            'address' => '135 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM',
            'description' => 'Di tích lịch sử quan trọng của Việt Nam',
            'is_free' => false,
            'price' => 40000
        ],
        [
            'name' => 'Nhà hàng Ngon',
            'type' => 'restaurant',
            'address' => '160 Pasteur, Quận 1, TP.HCM',
            'description' => 'Nhà hàng ẩm thực Việt Nam truyền thống',
            'price_range' => 'medium'
        ]
    ];
    
    $events = $controller->createMockScheduleFromDatabase($places, '2025-01-15', '2025-01-16', 'TP.HCM');
    
    return response()->json([
        'message' => 'Test mock schedule',
        'places_count' => count($places),
        'events_count' => count($events),
        'events' => $events
    ]);
});

// Test route để kiểm tra API keys
Route::get('/test-api-keys', function () {
    $results = [];
    
    // Test Google Maps API
    $googleKey = env('GOOGLE_MAPS_API_KEY');
    $url = "https://maps.googleapis.com/maps/api/geocode/json?address=Hanoi,Vietnam&key=" . $googleKey;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data['status'] === 'OK') {
            $results['google_maps'] = [
                'status' => 'working',
                'message' => 'Google Maps API is working',
                'location' => $data['results'][0]['formatted_address'] ?? 'Unknown'
            ];
        } else {
            $results['google_maps'] = [
                'status' => 'error',
                'message' => 'Google Maps API error: ' . $data['status']
            ];
        }
    } else {
        $results['google_maps'] = [
            'status' => 'error',
            'message' => 'Google Maps API HTTP Error: ' . $httpCode
        ];
    }
    
    // Test OpenAI API
    $openaiKey = env('OPENAI_API_KEY');
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/models');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $openaiKey,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $results['openai'] = [
            'status' => 'working',
            'message' => 'OpenAI API is working'
        ];
    } else {
        $data = json_decode($response, true);
        $results['openai'] = [
            'status' => 'error',
            'message' => 'OpenAI API error: ' . ($data['error']['message'] ?? 'Unknown error')
        ];
    }
    
    // Test OpenWeather API
    $weatherKey = env('OPENWEATHER_API_KEY');
    if ($weatherKey) {
        $url = "http://api.openweathermap.org/data/2.5/weather?q=Hanoi&appid=" . $weatherKey . "&units=metric";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            $results['openweather'] = [
                'status' => 'working',
                'message' => 'OpenWeather API is working',
                'temperature' => $data['main']['temp'] ?? 'Unknown'
            ];
        } else {
            $results['openweather'] = [
                'status' => 'error',
                'message' => 'OpenWeather API HTTP Error: ' . $httpCode
            ];
        }
    } else {
        $results['openweather'] = [
            'status' => 'not_configured',
            'message' => 'OpenWeather API key not configured'
        ];
    }
    
    return response()->json([
        'message' => 'API Keys Test Results',
        'results' => $results
    ]);
});