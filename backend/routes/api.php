<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CheckinPlaceController;
use App\Http\Controllers\Api\TransportCompanyController;
use App\Http\Controllers\Api\DishesController;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\ReviewController;

/*
|--------------------------------------------------------------------------
| API Routes
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

Route::get('/Restaurant/{id}/reviews', [ReviewController::class, 'index']);
Route::get('/Restaurant/{id}/reviews/stats', [ReviewController::class, 'getStats']);
Route::post('/Restaurant/{id}/reviews', [ReviewController::class, 'store']);

Route::get('/Restaurant/{id}/dishes', [DishesController::class, 'getByRestaurant']);
