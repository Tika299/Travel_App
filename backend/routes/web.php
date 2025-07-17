<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Auth\GoogleController;

Route::get('/', function () {
    return view('welcome');
});

// login google
Route::get('/api/auth/google/redirect', [GoogleController::class, 'redirect']);
Route::get('/api/auth/google/callback', [GoogleController::class, 'callback']);