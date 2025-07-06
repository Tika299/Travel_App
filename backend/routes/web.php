<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\CheckinPlaceController;
use App\Http\Controllers\Admin\TransportCompanyController;
use App\Http\Controllers\Admin\DishController;
use App\Http\Controllers\Admin\RestaurantController;


/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});
Route::prefix('admin')->name('admin.')->group(function () {
    Route::resource('dishes',DishController::class);
});

Route::prefix('admin')->name('admin.')->group(function () {
    Route::resource('restaurants', RestaurantController::class);
});


Route::prefix('admin')->name('admin.')->group(function () {
    Route::resource('checkin_places', CheckinPlaceController::class);
});

Route::prefix('admin')->name('admin.')->group(function () {
    Route::resource('transport_companies',TransportCompanyController::class);
});
