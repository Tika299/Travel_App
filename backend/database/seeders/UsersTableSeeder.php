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
            'password' => Hash::make('Admin99@'),
            'phone' => '0123456789',
            'status' => 'active',
            'role' => 'admin',
            'bio' => 'Quản trị hệ thống',
            'avatar' => 'img/68830be304d8c.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        User::create([
            'name' => 'Admin',
            'email' => 'admin123@gmail.com',
            'password' => Hash::make('Admin99@'),
            'phone' => '0321645879',
            'status' => 'active',
            'role' => 'admin',
            'bio' => 'Quản trị hệ thống',
            'avatar' => 'img/68830be304d8c.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        User::create([
            'name' => 'Nguyễn Văn Ân',
            'email' => 'nguyenvana@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654321',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Yêu thích du lịch một mình',
            'avatar' => 'img/68879458e3da2.jpg',
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
            'avatar' => 'img/avatar_user_review.jpg',
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
            'avatar' => 'img/avatar_user_review.jpg',
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
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        User::create([
            'name' => 'Hoàng Văn E',
            'email' => 'hoangvane@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654325',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Thích chụp ảnh',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 6
        User::create([
            'name' => 'Đặng Thị F',
            'email' => 'dangthif@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654326',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Người thích du lịch biển',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 7
        User::create([
            'name' => 'Ngô Văn G',
            'email' => 'ngovang@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654327',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Thích leo núi',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 8
        User::create([
            'name' => 'Bùi Thị H',
            'email' => 'buithih@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654328',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Đam mê du lịch nước ngoài',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 9
        User::create([
            'name' => 'Đỗ Văn I',
            'email' => 'dovani@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654329',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Yêu thích lịch sử',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 10
        User::create([
            'name' => 'Vũ Thị J',
            'email' => 'vuthij@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654330',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Thích đi du lịch gia đình',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 11
        User::create([
            'name' => 'Nguyễn Văn K',
            'email' => 'nguyenvank@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654331',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Người thích trải nghiệm mới',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 12
        User::create([
            'name' => 'Trần Thị L',
            'email' => 'tranthil@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654332',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Thích ăn uống và du lịch',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 13
        User::create([
            'name' => 'Lê Văn M',
            'email' => 'levanm@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654333',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Đam mê du lịch bụi',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 14
        User::create([
            'name' => 'Phạm Thị N',
            'email' => 'phamthin@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654334',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Người yêu thích khám phá thiên nhiên',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 15
        User::create([
            'name' => 'Hoàng Văn O',
            'email' => 'hoangvano@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654335',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Thích du lịch cùng bạn bè',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 16
        User::create([
            'name' => 'Đặng Thị P',
            'email' => 'dangthip@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654336',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Người thích nghỉ dưỡng',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 17
        User::create([
            'name' => 'Ngô Văn Q',
            'email' => 'ngovanq@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654337',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Yêu thích du lịch văn hoá',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 18
        User::create([
            'name' => 'Bùi Thị R',
            'email' => 'buithir@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654338',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Thích đi du lịch một mình',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 19
        User::create([
            'name' => 'Đỗ Văn S',
            'email' => 'dovans@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654339',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Đam mê du lịch trải nghiệm',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);

        // User 20
        User::create([
            'name' => 'Vũ Thị T',
            'email' => 'vuthit@example.com',
            'password' => Hash::make('password'),
            'phone' => '0987654340',
            'status' => 'active',
            'role' => 'user',
            'bio' => 'Người yêu thích du lịch sinh thái',
            'avatar' => 'img/avatar_user_review.jpg',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ]);
    }
}
