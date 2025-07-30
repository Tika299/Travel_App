<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransportCompany extends Model
{
    use HasFactory;

    protected $table = 'transport_companies';

    protected $fillable = [
        'transportation_id',
        'province_id',
        'name',
        'short_description',
        'description',
        'address',
        'latitude',
        'longitude',
        'logo',
        'operating_hours',
        'rating',
        'price_range',
        'phone_number',
        'email',
        'website',
        'payment_methods',
        'has_mobile_app',
        'highlight_services',
        'contact_response_time',
        'status',
    ];

    protected $casts = [
        'operating_hours' => 'array',
        'price_range' => 'array',
        'payment_methods' => 'array',
        'highlight_services' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
        'has_mobile_app' => 'boolean',
    ];
    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
      
    }
    /**
     * Quan hệ: hãng xe thuộc 1 loại phương tiện
     */
    public function transportation()
    {
        return $this->belongsTo(Transportation::class);
    }

    /**
     * Quan hệ: nếu bạn có bảng tỉnh (province), có thể thêm:
     */
    public function province()
    {
        return $this->belongsTo(Province::class);
    }

  
        
    
}
