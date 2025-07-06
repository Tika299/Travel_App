<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;


class UsersTableSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Quản trị viên',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'phone' => '0123456789',
            'status' => 'active',
            'role' => 'admin',
            'bio' => 'Quản trị hệ thống',
            'avatar' => 'avatars/admin.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        User::create([
            'name' => 'Nguyễn Văn A',
            'email' => 'nguyenvana@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654321',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Yêu thích du lịch',
            'avatar' => 'avatars/user1.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        User::create([
            'name' => 'Trần Thị B',
            'email' => 'tranthib@example.com',
            'password' => Hash::make('password'),
            'phone' => '0911222333',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Đam mê ẩm thực',
            'avatar' => 'avatars/user2.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        User::create([
            'name' => 'Lê Văn C',
            'email' => 'levanc@example.com',
            'password' => Hash::make('password'),
            'phone' => '0933444555',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Reviewer khách sạn',
            'avatar' => 'avatars/user3.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        User::create([
            'name' => 'Phạm Thị D',
            'email' => 'phamthid@example.com',
            'password' => Hash::make('password'),
            'phone' => '0966778899',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Hướng dẫn viên địa phương',
            'avatar' => 'avatars/user4.jpg'
        ]);

        // Thêm các người dùng mẫu khác để đảm bảo đủ ID cho ReviewsTableSeeder
        // Laravel sẽ tự động gán ID 6, 7, 8, 9, 10
        User::create([
            'name' => 'Đào Văn E',
            'email' => 'daovane@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Thích khám phá',
            'avatar' => 'avatars/user5.jpg'
        ]);

        User::create([
            'name' => 'Hoàng Thị F',
            'email' => 'hoangthif@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Chuyên gia review',
            'avatar' => 'avatars/user6.jpg'
        ]);

        User::create([
            'name' => 'Vũ Văn G',
            'email' => 'vuvang@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Reviewer có tâm',
            'avatar' => 'avatars/user7.jpg'
        ]);

        User::create([
            'name' => 'Nguyễn Thị H',
            'email' => 'nguyenthih@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Thích chụp ảnh',
            'avatar' => 'avatars/user8.jpg'
        ]);

        User::create([
            'name' => 'Trần Văn I',
            'email' => 'tranvani@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Thích đi phượt',
            'avatar' => 'avatars/user9.jpg'
        ]);
    }
}
