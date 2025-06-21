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
        'name',
        'contact_info',
        'address',
        'latitude',
        'longitude',
        'description',
        'logo',
        'operating_hours',
        'rating',
        'price_range',
        'phone_number',
        'email',
        'website',
        'payment_methods',
        'status', // ✅ Thêm dòng này
    ];

    protected $casts = [
        'operating_hours' => 'json',
        'price_range' => 'json',
        'payment_methods' => 'json',
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
    ];

    public function transportation()
    {
        return $this->belongsTo(Transportation::class);
    }

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
    }
}
