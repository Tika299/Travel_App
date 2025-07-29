<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
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


// Thêm API Restaurant(vanvu)
Route::apiResource('Restaurant', RestaurantController::class);
Route::get('/Restaurant/show/{id}', [RestaurantController::class, 'show']);
Route::put('/Restaurant/{id}', [RestaurantController::class, 'update']);
Route::delete('/Restaurant/delete/{restaurant}', [RestaurantController::class, 'destroy']);


Route::get('/Restaurant/{id}/reviews', [ReviewController::class, 'index']);
Route::get('/Restaurant/{id}/reviews/stats', [ReviewController::class, 'getStats']);
Route::post('/Restaurant/{id}/reviews', [ReviewController::class, 'store']);



