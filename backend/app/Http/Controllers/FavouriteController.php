<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Favourite;

class FavouriteController extends Controller
{
    public function index(Request $request)
    {
        // Lấy user hiện tại (giả sử đã đăng nhập, dùng auth()->id())
        $userId = $request->user() ? $request->user()->id : 1; // demo: user id 1

        $favourites = Favourite::with('favouritable')
            ->where('user_id', $userId)
            ->latest()
            ->get();

        return response()->json($favourites);
    }
}
