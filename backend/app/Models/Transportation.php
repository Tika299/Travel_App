<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transportation extends Model
{
    use HasFactory;

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
