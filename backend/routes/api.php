<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\LoginController;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Các route này sẽ tự động gắn prefix /api, ví dụ:
| http://localhost:8000/api/login
*/

// Đăng ký - Xác thực OTP
Route::post('/send-code', [VerificationController::class, 'sendCode']);
Route::post('/verify-code', [VerificationController::class, 'verifyCode']);

// Đăng nhập
Route::post('/login', [LoginController::class, 'login']);

// 🔐 Các route bảo vệ bởi Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Đăng xuất (Xóa token hiện tại)
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Đăng xuất thành công']);
    });

    // Lấy thông tin người dùng hiện tại
    Route::get('/me', function (Request $request) {
        return response()->json($request->user());
    });

    // Bạn có thể thêm các API cần bảo mật khác tại đây...
});
