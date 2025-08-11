<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'checkin_place_id',
        'participants',
        'description',
        'budget',
        'status',
        'progress',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function checkinPlace()
    {
        return $this->belongsTo(CheckInPlace::class, 'checkin_place_id');
    }
}
