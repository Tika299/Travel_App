<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use App\Models\Hotel; // <--- RẤT QUAN TRỌNG: Phải import Model Hotel

class CheckinPlace extends Model
{
    use HasFactory;

    protected $table = 'checkin_places';

    protected $fillable = [
        // ... các trường fillable khác của bạn
        'name', 'description', 'address', 'latitude', 'longitude', 'image', 'rating',
        'location_id', 'price', 'is_free', 'operating_hours', 'checkin_count',
        'review_count', 'images', 'region', 'caption', 'distance',
        'transport_options', 'status',
        // Thêm 'hotel_id' nếu bạn muốn nó có thể được gán trong fillable
        // 'hotel_id',
    ];

    protected $casts = [
        // ... các trường casts khác của bạn
        'latitude' => 'float', 'longitude' => 'float', 'rating' => 'float',
        'is_free' => 'boolean', 'operating_hours' => 'array', 'images' => 'array',
        'transport_options' => 'array',
    ];

    // ... các mối quan hệ khác của bạn (location, reviews, images, visitedUsers, dishes, transportCompanies)

    /**
     * Mối quan hệ: Địa điểm check-in này thuộc về một khách sạn.
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function linkedHotels() // Bạn có thể đổi tên thành 'hotel' để dễ hiểu hơn
    {
        // Giả sử cột khóa ngoại trong bảng 'checkin_places' là 'hotel_id'
        return $this->belongsTo(Hotel::class, 'hotel_id');
    }
}
