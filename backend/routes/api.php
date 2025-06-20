<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CuisineController;
use App\Http\Controllers\Api\CategoryController;

Route::apiResource('cuisines', CuisineController::class);
Route::apiResource('categories', CategoryController::class);