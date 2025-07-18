<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // Thêm nếu bạn đang dùng Soft Deletes

class Transportation extends Model
{
    use HasFactory;
    // Nếu bạn đang dùng SoftDeletes, bỏ comment dòng dưới:
    // use SoftDeletes;

    protected $fillable = [
        'name',
        'icon',
        'banner',
        'average_price',
        'description',
        'tags',
        'features',
        'rating',
        'is_visible',
    ];


    /**
     * Các thuộc tính nên được ép kiểu.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tags' => 'array',        // ✨ Dòng này rất quan trọng cho 'tags' ✨
        'features' => 'array',    // ✨ Dòng này rất quan trọng cho 'features' ✨
        'is_visible' => 'boolean', // Nên ép kiểu boolean để Laravel xử lý đúng True/False
        // 'average_price' => 'float', // Tùy chọn: nếu bạn muốn average_price luôn là số thập phân
        // 'rating' => 'float',       // Tùy chọn: nếu bạn muốn rating luôn là số thập phân
    ];
}

    protected $casts = [
        'tags' => 'array',      // ✅ ["uy_tin", "pho_bien"]
        'features' => 'array',  // ✅ ["has_app", "card_payment"]
        'average_price' => 'decimal:2',
        'rating' => 'decimal:1',
        'is_visible' => 'boolean',
    ];

    /**
     * Một loại phương tiện có nhiều hãng.
     */
    public function companies()
    {
        return $this->hasMany(TransportCompany::class);
    }
}

