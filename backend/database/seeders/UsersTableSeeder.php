<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;


class UsersTableSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('users')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        User::create([
            'name' => 'Quản trị viên',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'bio' => 'Quản trị hệ thống',
            'avatar' => 'avatars/admin.jpg'
        ]);

        User::create([
            'name' => 'Nguyễn Văn A',
            'email' => 'nguyenvana@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Yêu thích du lịch',
            'avatar' => 'avatars/user1.jpg'
        ]);

        User::create([
            'name' => 'Trần Thị B',
            'email' => 'tranthib@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Đam mê ẩm thực',
            'avatar' => 'avatars/user2.jpg'
        ]);

        User::create([
            'name' => 'Lê Văn C',
            'email' => 'levanc@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Reviewer khách sạn',
            'avatar' => 'avatars/user3.jpg'
        ]);

        User::create([
            'name' => 'Phạm Thị D',
            'email' => 'phamthid@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Hướng dẫn viên địa phương',
            'avatar' => 'avatars/user4.jpg'
        ]);
    }
}
