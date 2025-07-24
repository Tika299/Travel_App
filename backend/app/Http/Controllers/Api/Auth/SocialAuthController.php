<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
 use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class SocialAuthController extends Controller
{
   
public function redirectToFacebook()
{
    return Socialite::driver('facebook')->redirect();
}

public function handleFacebookCallback()
{
    try {
        $facebookUser = Socialite::driver('facebook')->user();

        $user = User::updateOrCreate(
            ['facebook_id' => $facebookUser->getId()],
            [
                'name' => $facebookUser->getName(),
                'email' => $facebookUser->getEmail(),
                'facebook_id' => $facebookUser->getId(),
                'avatar' => $facebookUser->getAvatar(), 
                'password' => Hash::make(12345),
                
            ]
        );

        // Tạo token đăng nhập
        $token = $user->createToken('facebook-token')->plainTextToken;

        // return redirect("http://localhost:5173/facebook-success?token=$token");
        // return redirect("http://localhost:5173/");
        return redirect("http://localhost:5173/oauth-success?token=$token&email=" . urlencode($user->email) . "&avatar=" . urlencode($user->avatar));

    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

}
