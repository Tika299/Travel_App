<?php
use Illuminate\Support\Facades\Route;


use App\Http\Controllers\Api\VerificationController;


//user
Route::post('/send-code', [VerificationController::class, 'sendCode']);
Route::post('/verify-code', [VerificationController::class, 'verifyCode']);
