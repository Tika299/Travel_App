<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FavouriteController;

Route::middleware('api')->get('/favourites', [FavouriteController::class, 'index']);