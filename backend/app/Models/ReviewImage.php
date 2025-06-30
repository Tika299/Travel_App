<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReviewImage extends Model
{
    protected $fillable = [
        'review_id',
        'image_path',
        'is_webcam',
    ];

    protected $casts = [
        'is_webcam' => 'boolean',
    ];

    public function review()
    {
        return $this->belongsTo(Review::class);
    }
    public function getImageUrlAttribute()
    {
        return $this->image_path ? asset('storage/' . $this->image_path) : null;
    }
}
