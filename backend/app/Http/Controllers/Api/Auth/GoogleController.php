<?php

namespace App\Http\Controllers\Api\Auth;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

use App\Models\User;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    //
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->user();

        // Tìm hoặc tạo người dùng
        $user = User::updateOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                'password' => bcrypt(Str::random(16)),
            ]
        );

        // Tạo token và trả về frontend
        $token = $user->createToken('auth_token')->plainTextToken;

        // return redirect("http://localhost:5173/google-success?token=$token");
        return redirect("http://localhost:5173/");
    }
}
