<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'user_id',
        'reviewable_type',
        'reviewable_id',
        'content',
        'rating',
        'is_approved',
    ];

    protected $casts = [
        'rating' => 'float',
        'is_approved' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewable()
    {
        return $this->morphTo();
    }
    public function images()
    {
        return $this->hasMany(ReviewImage::class);
    }
    public function interactions()
    {
        return $this->morphMany(Interaction::class, 'interactable');
    }
}
