<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CheckinPlaceController;
use App\Http\Controllers\Api\TransportCompanyController;
use App\Http\Controllers\Api\DishesController;
use App\Http\Controllers\Admin\DishController;
use App\Http\Controllers\Api\RestaurantController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ItinerariesController;
use App\Http\Controllers\Api\LocationController;

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
Route::apiResource('dishe',DishController::class);
Route::get('/dishe/show/{id}', [DishController::class, 'show']);
Route::put('/dishe/{id}', [DishController::class, 'update']);
Route::delete('/dishe/delete/{dish}', [DishController::class, 'destroy']);


// Thêm API Restaurant(vanvu)
Route::apiResource('Restaurant', RestaurantController::class);
Route::get('/Restaurant/show/{id}', [RestaurantController::class, 'show']);
Route::put('/Restaurant/{id}', [RestaurantController::class, 'update']);
Route::delete('/Restaurant/delete/{restaurant}', [RestaurantController::class, 'destroy']);


Route::apiResource('itineraries', ItinerariesController::class);
Route::apiResource('Location', LocationController::class);




Route::get('/Restaurant/{id}/reviews', [ReviewController::class, 'index']);
Route::get('/Restaurant/{id}/reviews/stats', [ReviewController::class, 'getStats']);
Route::post('/Restaurant/{id}/reviews', [ReviewController::class, 'store']);

Route::get('/Restaurant/{id}/dishes', [DishesController::class, 'getByRestaurant']);


