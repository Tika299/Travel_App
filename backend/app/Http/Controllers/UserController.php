<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage; // ✅ THÊM DÒNG NÀY

class UserController extends Controller
{
    public function getUserInfo()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'bio' => $user->bio,
            'phone' => $user->phone,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at
        ]);
    }

    public function update(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $user->name = $request->name;
        $user->phone = $request->phone;
        $user->bio = $request->bio;
        $user->save();

        return response()->json(['message' => 'Cập nhật thành công']);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($request->hasFile('avatar')) {
            $image = $request->file('avatar');

            $filename = uniqid() . '.' . $image->getClientOriginalExtension();

            $frontendPath = base_path('../frontend/public/img'); // 🟢 nơi chứa ảnh trong React
            $image->move($frontendPath, $filename);

            $user->avatar = 'img/' . $filename;
            $user->save();

            return response()->json([
                'message' => 'Cập nhật ảnh đại diện thành công',
                'avatar_url' => '/img/' . $filename, // ✅ trả về đường dẫn tương đối
            ]);
        }

        return response()->json(['message' => 'Không tìm thấy ảnh'], 400);
    }

    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function stats()
    {
        $total = User::count();
        $active = User::where('status', 'active')->count();
        $inactive = User::where('status', 'inactive')->count();
        $today = User::whereDate('created_at', today())->count();

        return response()->json([
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
            'today' => $today,
        ]);
    }


    // app/Http/Controllers/UserController.php
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function deleteMultiple(Request $request)
    {
        $ids = $request->input('ids');
        User::whereIn('id', $ids)->delete();
        return response()->json(['message' => 'Selected users deleted successfully']);
    }
}
