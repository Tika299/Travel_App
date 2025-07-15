<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    /**
     * Các thuộc tính có thể gán hàng loạt.
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'email_verified_at',
        'status',
        'role',
        'avatar',
        'bio',
        'remember_token',
    ];

    /**
     * Thuộc tính cần ẩn khi xuất ra JSON.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Thuộc tính được ép kiểu.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // 👉 Nơi khai báo quan hệ với các bảng khác (nếu có)
    // Ví dụ: public function posts() { return $this->hasMany(Post::class); }
}
