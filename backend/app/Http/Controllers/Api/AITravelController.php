<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CheckinPlace;
use App\Models\Hotel;
use App\Models\Restaurant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Services\WeatherService;

class AITravelController extends Controller
{
    public function generateItinerary(Request $request)
    {
        try {
            // Validate input
            $validated = $request->validate([
                'destination' => 'required|string|max:255',
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after:start_date',
                'budget' => 'required|numeric|min:100000',
                'travelers' => 'required|integer|min:1|max:10',
                'preferences' => 'nullable|array',
                'preferences.*' => 'string',
                'suggestWeather' => 'nullable|boolean',
                'suggestBudget' => 'nullable|boolean'
            ]);

            $startDate = Carbon::parse($validated['start_date']);
            $endDate = Carbon::parse($validated['end_date']);
            $daysCount = $startDate->diffInDays($endDate) + 1;

            // Kiểm tra giới hạn 5 ngày
            if ($daysCount > 5) {
                return response()->json([
                    'success' => false,
                    'message' => 'Để tạo lịch trình hơn 5 ngày, bạn cần là thành viên VIP của IPSUM Travel. Vui lòng nâng cấp tài khoản để sử dụng tính năng này.',
                    'upgrade_required' => true,
                    'max_days' => 5,
                    'requested_days' => $daysCount
                ], 403);
            }

            // Lấy dữ liệu từ database
            $data = $this->getTravelData($validated['destination']);

            // Lấy thông tin thời tiết nếu được yêu cầu
            $weatherData = null;
            $weatherRecommendations = null;
            if ($validated['suggestWeather'] ?? false) {
                $weatherService = new WeatherService();
                
                // Chuyển đổi tên thành phố sang tiếng Anh để tránh lỗi encoding
                $cityMap = [
                    'TP. Hồ Chí Minh' => 'Ho Chi Minh City',
                    'Hồ Chí Minh' => 'Ho Chi Minh City',
                    'Sài Gòn' => 'Ho Chi Minh City',
                    'Đà Nẵng' => 'Da Nang',
                    'Hà Nội' => 'Hanoi',
                    'Nha Trang' => 'Nha Trang',
                    'Phú Quốc' => 'Phu Quoc',
                    'Huế' => 'Hue',
                    'Hội An' => 'Hoi An'
                ];
                
                $englishCityName = $cityMap[$validated['destination']] ?? $validated['destination'];
                $weatherData = $weatherService->getWeather($englishCityName);
                $weatherRecommendations = $weatherService->getWeatherRecommendations($weatherData);
                
                // Lọc địa điểm dựa trên thời tiết
                if ($weatherData['success'] && isset($data['checkin_places'])) {
                    $data['checkin_places'] = $weatherService->filterPlacesByWeather($data['checkin_places'], $weatherRecommendations);
                    $data['hotels'] = $weatherService->filterPlacesByWeather($data['hotels'], $weatherRecommendations);
                    $data['restaurants'] = $weatherService->filterPlacesByWeather($data['restaurants'], $weatherRecommendations);
                }
            }

            // Tạo prompt cho OpenAI
            $prompt = $this->createAIPrompt($validated, $data, $daysCount, $weatherData, $weatherRecommendations);

            // Gọi OpenAI API
            $itinerary = $this->callOpenAI($prompt, $validated['start_date'], $validated['end_date']);
            
            // Debug: Log itinerary để kiểm tra
            Log::info('AI Itinerary Response:', [
                'itinerary' => $itinerary,
                'days_count' => isset($itinerary['days']) ? count($itinerary['days']) : 0,
                'has_activities' => isset($itinerary['days'][0]['activities']) ? count($itinerary['days'][0]['activities']) : 0
            ]);

            // KHÔNG lưu vào database ngay, chỉ trả về dữ liệu để hiển thị popup xác nhận
            // Tính toán lại thông tin cho response
            $actualDaysCount = isset($itinerary['days']) ? count($itinerary['days']) : 1;
            $requestedDaysCount = Carbon::parse($validated['start_date'])->diffInDays($validated['end_date']) + 1;
            $actualDaysCount = min($actualDaysCount, $requestedDaysCount);
            $actualEndDate = Carbon::parse($validated['start_date'])->addDays($actualDaysCount - 1)->format('Y-m-d');

            return response()->json([
                'success' => true,
                'message' => 'Lịch trình đã được tạo thành công!',
                'data' => [
                    'summary' => [
                        'destination' => $validated['destination'],
                        'duration' => $actualDaysCount . ' ngày',
                        'budget' => number_format($validated['budget']) . ' VND',
                        'travelers' => $validated['travelers'] . ' người',
                        'actual_end_date' => $actualEndDate
                    ],
                    // Thêm dữ liệu itinerary gốc để frontend có thể hiển thị trong popup
                    'itinerary_data' => [
                        'summary' => [
                            'destination' => $validated['destination'],
                            'total_cost' => $itinerary['summary']['total_cost'] ?? 0,
                            'daily_average' => $itinerary['summary']['daily_average'] ?? 0,
                            'days_count' => $actualDaysCount,
                            'total_activities' => isset($itinerary['days']) ? array_sum(array_map(function($day) {
                                return isset($day['activities']) ? count($day['activities']) : 0;
                            }, $itinerary['days'])) : 0
                        ],
                        'days' => $itinerary['days'] ?? []
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('AI Travel Planning Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi tạo lịch trình. Vui lòng thử lại sau.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    private function getTravelData($destination)
    {
        // Map destination to region
        $regionMap = [
            'TP. Hồ Chí Minh' => 'Nam',
            'Hồ Chí Minh' => 'Nam',
            'Sài Gòn' => 'Nam',
            'Hà Nội' => 'Bắc',
            'Đà Nẵng' => 'Trung',
            'Huế' => 'Trung',
            'Hội An' => 'Trung',
            'Nha Trang' => 'Trung',
            'Phú Quốc' => 'Nam',
            'Đà Lạt' => 'Nam'
        ];
        
        $region = $regionMap[$destination] ?? null;
        
        // Tìm kiếm địa điểm dựa trên destination và region
        $checkinPlaces = CheckinPlace::where(function($query) use ($destination, $region) {
            $query->where('name', 'like', '%' . $destination . '%')
                  ->orWhere('address', 'like', '%' . $destination . '%');
            
            // Tự động nhận diện tỉnh thành từ destination
            if (str_contains(strtolower($destination), 'hồ chí minh') || str_contains(strtolower($destination), 'tp.hcm') || str_contains(strtolower($destination), 'sài gòn')) {
                $query->orWhere('address', 'like', '%TP.HCM%')
                      ->orWhere('address', 'like', '%Quận 1%')
                      ->orWhere('address', 'like', '%Quận 2%')
                      ->orWhere('address', 'like', '%Quận 3%')
                      ->orWhere('address', 'like', '%Quận 4%')
                      ->orWhere('address', 'like', '%Quận 5%')
                      ->orWhere('address', 'like', '%Quận 6%')
                      ->orWhere('address', 'like', '%Quận 7%')
                      ->orWhere('address', 'like', '%Quận 8%')
                      ->orWhere('address', 'like', '%Quận 9%')
                      ->orWhere('address', 'like', '%Quận 10%')
                      ->orWhere('address', 'like', '%Quận 11%')
                      ->orWhere('address', 'like', '%Quận 12%')
                      ->orWhere('address', 'like', '%Bình Thạnh%')
                      ->orWhere('address', 'like', '%Tân Bình%')
                      ->orWhere('address', 'like', '%Phú Nhuận%')
                      ->orWhere('address', 'like', '%Gò Vấp%')
                      ->orWhere('address', 'like', '%Tân Phú%')
                      ->orWhere('address', 'like', '%Bình Tân%')
                      ->orWhere('address', 'like', '%Củ Chi%')
                      ->orWhere('address', 'like', '%Hóc Môn%')
                      ->orWhere('address', 'like', '%Bình Chánh%')
                      ->orWhere('address', 'like', '%Nhà Bè%')
                      ->orWhere('address', 'like', '%Cần Giờ%');
            } elseif (str_contains(strtolower($destination), 'đà nẵng')) {
                $query->orWhere('address', 'like', '%Đà Nẵng%')
                      ->orWhere('address', 'like', '%Quận Hải Châu%')
                      ->orWhere('address', 'like', '%Quận Thanh Khê%')
                      ->orWhere('address', 'like', '%Quận Sơn Trà%')
                      ->orWhere('address', 'like', '%Quận Ngũ Hành Sơn%')
                      ->orWhere('address', 'like', '%Quận Liên Chiểu%')
                      ->orWhere('address', 'like', '%Quận Cẩm Lệ%')
                      ->orWhere('address', 'like', '%Huyện Hòa Vang%')
                      ->orWhere('address', 'like', '%Huyện Hoàng Sa%');
            } elseif (str_contains(strtolower($destination), 'hà nội')) {
                $query->orWhere('address', 'like', '%Hà Nội%')
                      ->orWhere('address', 'like', '%Quận Ba Đình%')
                      ->orWhere('address', 'like', '%Quận Hoàn Kiếm%')
                      ->orWhere('address', 'like', '%Quận Hai Bà Trưng%')
                      ->orWhere('address', 'like', '%Quận Đống Đa%')
                      ->orWhere('address', 'like', '%Quận Tây Hồ%')
                      ->orWhere('address', 'like', '%Quận Cầu Giấy%')
                      ->orWhere('address', 'like', '%Quận Thanh Xuân%')
                      ->orWhere('address', 'like', '%Quận Hoàng Mai%')
                      ->orWhere('address', 'like', '%Quận Long Biên%')
                      ->orWhere('address', 'like', '%Quận Nam Từ Liêm%')
                      ->orWhere('address', 'like', '%Quận Bắc Từ Liêm%')
                      ->orWhere('address', 'like', '%Huyện Thanh Trì%')
                      ->orWhere('address', 'like', '%Huyện Gia Lâm%')
                      ->orWhere('address', 'like', '%Huyện Đông Anh%')
                      ->orWhere('address', 'like', '%Huyện Sóc Sơn%')
                      ->orWhere('address', 'like', '%Huyện Ba Vì%')
                      ->orWhere('address', 'like', '%Huyện Phúc Thọ%')
                      ->orWhere('address', 'like', '%Huyện Thạch Thất%')
                      ->orWhere('address', 'like', '%Huyện Quốc Oai%')
                      ->orWhere('address', 'like', '%Huyện Chương Mỹ%')
                      ->orWhere('address', 'like', '%Huyện Thanh Oai%')
                      ->orWhere('address', 'like', '%Huyện Thường Tín%')
                      ->orWhere('address', 'like', '%Huyện Phú Xuyên%')
                      ->orWhere('address', 'like', '%Huyện Ứng Hòa%')
                      ->orWhere('address', 'like', '%Huyện Mỹ Đức%');
            }
        })
        ->limit(20)
        ->get();

        // Tìm hotels với logic tìm kiếm chi tiết hơn
        $hotels = Hotel::where(function($query) use ($destination) {
            $query->where('name', 'like', '%' . $destination . '%')
                  ->orWhere('address', 'like', '%' . $destination . '%');
            
            // Tự động nhận diện tỉnh thành từ destination
            if (str_contains(strtolower($destination), 'hồ chí minh') || str_contains(strtolower($destination), 'tp.hcm') || str_contains(strtolower($destination), 'sài gòn')) {
                $query->orWhere('address', 'like', '%TP.HCM%')
                      ->orWhere('address', 'like', '%Quận 1%')
                      ->orWhere('address', 'like', '%Quận 2%')
                      ->orWhere('address', 'like', '%Quận 3%')
                      ->orWhere('address', 'like', '%Quận 4%')
                      ->orWhere('address', 'like', '%Quận 5%')
                      ->orWhere('address', 'like', '%Quận 6%')
                      ->orWhere('address', 'like', '%Quận 7%')
                      ->orWhere('address', 'like', '%Quận 8%')
                      ->orWhere('address', 'like', '%Quận 9%')
                      ->orWhere('address', 'like', '%Quận 10%')
                      ->orWhere('address', 'like', '%Quận 11%')
                      ->orWhere('address', 'like', '%Quận 12%')
                      ->orWhere('address', 'like', '%Bình Thạnh%')
                      ->orWhere('address', 'like', '%Tân Bình%')
                      ->orWhere('address', 'like', '%Phú Nhuận%')
                      ->orWhere('address', 'like', '%Gò Vấp%')
                      ->orWhere('address', 'like', '%Tân Phú%')
                      ->orWhere('address', 'like', '%Bình Tân%')
                      ->orWhere('address', 'like', '%Củ Chi%')
                      ->orWhere('address', 'like', '%Hóc Môn%')
                      ->orWhere('address', 'like', '%Bình Chánh%')
                      ->orWhere('address', 'like', '%Nhà Bè%')
                      ->orWhere('address', 'like', '%Cần Giờ%');
            } elseif (str_contains(strtolower($destination), 'đà nẵng')) {
                $query->orWhere('address', 'like', '%Đà Nẵng%')
                      ->orWhere('address', 'like', '%Quận Hải Châu%')
                      ->orWhere('address', 'like', '%Quận Thanh Khê%')
                      ->orWhere('address', 'like', '%Quận Sơn Trà%')
                      ->orWhere('address', 'like', '%Quận Ngũ Hành Sơn%')
                      ->orWhere('address', 'like', '%Quận Liên Chiểu%')
                      ->orWhere('address', 'like', '%Quận Cẩm Lệ%')
                      ->orWhere('address', 'like', '%Huyện Hòa Vang%')
                      ->orWhere('address', 'like', '%Huyện Hoàng Sa%');
            } elseif (str_contains(strtolower($destination), 'hà nội')) {
                $query->orWhere('address', 'like', '%Hà Nội%')
                      ->orWhere('address', 'like', '%Quận Ba Đình%')
                      ->orWhere('address', 'like', '%Quận Hoàn Kiếm%')
                      ->orWhere('address', 'like', '%Quận Hai Bà Trưng%')
                      ->orWhere('address', 'like', '%Quận Đống Đa%')
                      ->orWhere('address', 'like', '%Quận Tây Hồ%')
                      ->orWhere('address', 'like', '%Quận Cầu Giấy%')
                      ->orWhere('address', 'like', '%Quận Thanh Xuân%')
                      ->orWhere('address', 'like', '%Quận Hoàng Mai%')
                      ->orWhere('address', 'like', '%Quận Long Biên%')
                      ->orWhere('address', 'like', '%Quận Nam Từ Liêm%')
                      ->orWhere('address', 'like', '%Quận Bắc Từ Liêm%')
                      ->orWhere('address', 'like', '%Huyện Thanh Trì%')
                      ->orWhere('address', 'like', '%Huyện Gia Lâm%')
                      ->orWhere('address', 'like', '%Huyện Đông Anh%')
                      ->orWhere('address', 'like', '%Huyện Sóc Sơn%')
                      ->orWhere('address', 'like', '%Huyện Ba Vì%')
                      ->orWhere('address', 'like', '%Huyện Phúc Thọ%')
                      ->orWhere('address', 'like', '%Huyện Thạch Thất%')
                      ->orWhere('address', 'like', '%Huyện Quốc Oai%')
                      ->orWhere('address', 'like', '%Huyện Chương Mỹ%')
                      ->orWhere('address', 'like', '%Huyện Thanh Oai%')
                      ->orWhere('address', 'like', '%Huyện Thường Tín%')
                      ->orWhere('address', 'like', '%Huyện Phú Xuyên%')
                      ->orWhere('address', 'like', '%Huyện Ứng Hòa%')
                      ->orWhere('address', 'like', '%Huyện Mỹ Đức%');
            }
        })
        ->limit(15)
        ->get();

        // Tìm restaurants với logic tìm kiếm chi tiết hơn
        $restaurants = Restaurant::where(function($query) use ($destination) {
            $query->where('name', 'like', '%' . $destination . '%')
                  ->orWhere('address', 'like', '%' . $destination . '%');
            
            // Tự động nhận diện tỉnh thành từ destination
            if (str_contains(strtolower($destination), 'hồ chí minh') || str_contains(strtolower($destination), 'tp.hcm') || str_contains(strtolower($destination), 'sài gòn')) {
                $query->orWhere('address', 'like', '%TP.HCM%')
                      ->orWhere('address', 'like', '%Quận 1%')
                      ->orWhere('address', 'like', '%Quận 2%')
                      ->orWhere('address', 'like', '%Quận 3%')
                      ->orWhere('address', 'like', '%Quận 4%')
                      ->orWhere('address', 'like', '%Quận 5%')
                      ->orWhere('address', 'like', '%Quận 6%')
                      ->orWhere('address', 'like', '%Quận 7%')
                      ->orWhere('address', 'like', '%Quận 8%')
                      ->orWhere('address', 'like', '%Quận 9%')
                      ->orWhere('address', 'like', '%Quận 10%')
                      ->orWhere('address', 'like', '%Quận 11%')
                      ->orWhere('address', 'like', '%Quận 12%')
                      ->orWhere('address', 'like', '%Bình Thạnh%')
                      ->orWhere('address', 'like', '%Tân Bình%')
                      ->orWhere('address', 'like', '%Phú Nhuận%')
                      ->orWhere('address', 'like', '%Gò Vấp%')
                      ->orWhere('address', 'like', '%Tân Phú%')
                      ->orWhere('address', 'like', '%Bình Tân%')
                      ->orWhere('address', 'like', '%Củ Chi%')
                      ->orWhere('address', 'like', '%Hóc Môn%')
                      ->orWhere('address', 'like', '%Bình Chánh%')
                      ->orWhere('address', 'like', '%Nhà Bè%')
                      ->orWhere('address', 'like', '%Cần Giờ%');
            } elseif (str_contains(strtolower($destination), 'đà nẵng')) {
                $query->orWhere('address', 'like', '%Đà Nẵng%')
                      ->orWhere('address', 'like', '%Quận Hải Châu%')
                      ->orWhere('address', 'like', '%Quận Thanh Khê%')
                      ->orWhere('address', 'like', '%Quận Sơn Trà%')
                      ->orWhere('address', 'like', '%Quận Ngũ Hành Sơn%')
                      ->orWhere('address', 'like', '%Quận Liên Chiểu%')
                      ->orWhere('address', 'like', '%Quận Cẩm Lệ%')
                      ->orWhere('address', 'like', '%Huyện Hòa Vang%')
                      ->orWhere('address', 'like', '%Huyện Hoàng Sa%');
            } elseif (str_contains(strtolower($destination), 'hà nội')) {
                $query->orWhere('address', 'like', '%Hà Nội%')
                      ->orWhere('address', 'like', '%Quận Ba Đình%')
                      ->orWhere('address', 'like', '%Quận Hoàn Kiếm%')
                      ->orWhere('address', 'like', '%Quận Hai Bà Trưng%')
                      ->orWhere('address', 'like', '%Quận Đống Đa%')
                      ->orWhere('address', 'like', '%Quận Tây Hồ%')
                      ->orWhere('address', 'like', '%Quận Cầu Giấy%')
                      ->orWhere('address', 'like', '%Quận Thanh Xuân%')
                      ->orWhere('address', 'like', '%Quận Hoàng Mai%')
                      ->orWhere('address', 'like', '%Quận Long Biên%')
                      ->orWhere('address', 'like', '%Quận Nam Từ Liêm%')
                      ->orWhere('address', 'like', '%Quận Bắc Từ Liêm%')
                      ->orWhere('address', 'like', '%Huyện Thanh Trì%')
                      ->orWhere('address', 'like', '%Huyện Gia Lâm%')
                      ->orWhere('address', 'like', '%Huyện Đông Anh%')
                      ->orWhere('address', 'like', '%Huyện Sóc Sơn%')
                      ->orWhere('address', 'like', '%Huyện Ba Vì%')
                      ->orWhere('address', 'like', '%Huyện Phúc Thọ%')
                      ->orWhere('address', 'like', '%Huyện Thạch Thất%')
                      ->orWhere('address', 'like', '%Huyện Quốc Oai%')
                      ->orWhere('address', 'like', '%Huyện Chương Mỹ%')
                      ->orWhere('address', 'like', '%Huyện Thanh Oai%')
                      ->orWhere('address', 'like', '%Huyện Thường Tín%')
                      ->orWhere('address', 'like', '%Huyện Phú Xuyên%')
                      ->orWhere('address', 'like', '%Huyện Ứng Hòa%')
                      ->orWhere('address', 'like', '%Huyện Mỹ Đức%');
            }
        })
        ->where('name', 'not like', '%Group%')
        ->where('name', 'not like', '%LLC%')
        ->where('name', 'not like', '%Inc%')
        ->where('name', 'not like', '%Ltd%')
        ->where('name', 'not like', '%PLC%')
        ->where('name', 'not like', '%Sons%')
        ->where('name', 'not like', '%and%')
        ->where('name', 'not like', '%-%')
        ->where('name', 'not like', '%[0-9]%')
        ->limit(15)
        ->get();

        return [
            'checkin_places' => $checkinPlaces,
            'hotels' => $hotels,
            'restaurants' => $restaurants
        ];
    }

    private function createAIPrompt($validated, $data, $daysCount, $weatherData = null, $weatherRecommendations = null)
    {
        $destination = $validated['destination'];
        $budget = $validated['budget'];
        $travelers = $validated['travelers'];
        $preferences = $validated['preferences'] ?? [];
        $suggestWeather = $validated['suggestWeather'] ?? false;
        $suggestBudget = $validated['suggestBudget'] ?? false;

        $prompt = "Bạn là một chuyên gia du lịch Việt Nam. Hãy tạo lịch trình du lịch chi tiết cho {$daysCount} ngày tại {$destination} với ngân sách {$budget} VND cho {$travelers} người.\n\n";

        // Thêm thông tin thời tiết nếu có
        if ($weatherData && $weatherData['success'] && $weatherRecommendations) {
            $weatherInfo = $weatherData['data'];
            $prompt .= "🌤️ THÔNG TIN THỜI TIẾT HIỆN TẠI TẠI {$destination}:\n";
            $prompt .= "- Nhiệt độ: {$weatherInfo['temperature']}°C\n";
            $prompt .= "- Mô tả: {$weatherInfo['description']}\n";
            $prompt .= "- Độ ẩm: {$weatherInfo['humidity']}%\n";
            if ($weatherInfo['rain'] > 0) $prompt .= "- Có mưa: {$weatherInfo['rain']}mm\n";
            if ($weatherInfo['snow'] > 0) $prompt .= "- Có tuyết: {$weatherInfo['snow']}mm\n";
            $prompt .= "- Gió: {$weatherInfo['wind_speed']} m/s\n\n";

            $prompt .= "📋 GỢI Ý HOẠT ĐỘNG DỰA TRÊN THỜI TIẾT:\n";
            foreach ($weatherRecommendations as $type => $rec) {
                $prompt .= "- {$rec['message']}\n";
                if (isset($rec['activities']['indoor'])) {
                    $prompt .= "  + Hoạt động trong nhà: " . implode(', ', $rec['activities']['indoor']) . "\n";
                }
                if (isset($rec['activities']['outdoor'])) {
                    $prompt .= "  + Hoạt động ngoài trời: " . implode(', ', $rec['activities']['outdoor']) . "\n";
                }
            }
            $prompt .= "\n";
        }

        // Thêm thông tin về smart suggestions
        if ($suggestWeather) {
            $prompt .= "Yêu cầu: Tạo gợi ý hoạt động phù hợp với thời tiết hiện tại tại {$destination}.\n";
        }
        
        if ($suggestBudget) {
            $prompt .= "Yêu cầu: Tối ưu hóa ngân sách, đề xuất hoạt động phù hợp với ngân sách {$budget} VND.\n";
        }
        
        if ($suggestWeather && $suggestBudget) {
            $prompt .= "Yêu cầu: Kết hợp cả hai - tạo gợi ý phù hợp với thời tiết và tối ưu ngân sách.\n";
        }
        
        if (!$suggestWeather && !$suggestBudget) {
            $prompt .= "Yêu cầu: Tạo lịch trình tổng quát không phụ thuộc vào thời tiết hoặc tối ưu ngân sách.\n";
        }
        
        $prompt .= "\n";

        // Thêm preferences
        if (!empty($preferences)) {
            $prompt .= "Sở thích: " . implode(', ', $preferences) . "\n\n";
        }

        // Thêm dữ liệu địa điểm
        if (isset($data['checkin_places']) && count($data['checkin_places']) > 0) {
            $prompt .= "Các địa điểm tham quan có sẵn:\n";
            foreach ($data['checkin_places'] as $place) {
                $price = $place->is_free ? 'Miễn phí' : number_format($place->price) . ' VND';
                $prompt .= "- {$place->name}: {$place->description} (Giá: {$price})\n";
            }
            $prompt .= "\n";
        }

        // Thêm dữ liệu khách sạn
        if (isset($data['hotels']) && count($data['hotels']) > 0) {
            $prompt .= "Các khách sạn có sẵn:\n";
            foreach ($data['hotels'] as $hotel) {
                $minPrice = $hotel->rooms->min('price_per_night') ?? 0;
                $prompt .= "- {$hotel->name}: {$hotel->description} (Từ " . number_format($minPrice) . " VND/đêm)\n";
            }
            $prompt .= "\n";
        }

        // Thêm dữ liệu nhà hàng
        if (isset($data['restaurants']) && count($data['restaurants']) > 0) {
            $prompt .= "Các nhà hàng có sẵn:\n";
            foreach ($data['restaurants'] as $restaurant) {
                $prompt .= "- {$restaurant->name}: {$restaurant->description} (Khoảng giá: {$restaurant->price_range})\n";
            }
            $prompt .= "\n";
        }

        $prompt .= "Yêu cầu:\n";
        $prompt .= "1. Tạo lịch trình chi tiết cho từng ngày\n";
        $prompt .= "2. Phân bổ ngân sách hợp lý cho từng hạng mục\n";
        $prompt .= "3. Đề xuất thời gian tham quan phù hợp\n";
        $prompt .= "4. CHỈ gợi ý 3 loại: địa điểm tham quan, nhà hàng, khách sạn (KHÔNG có phương tiện di chuyển)\n";
        $prompt .= "5. BẮT BUỘC sử dụng chính xác tên địa điểm, khách sạn, nhà hàng từ danh sách có sẵn ở trên. KHÔNG được tự tạo tên mới.\n";
        $prompt .= "6. Nếu không có địa điểm phù hợp trong danh sách, hãy chọn địa điểm gần nhất hoặc tương tự.\n";
        $prompt .= "7. Ví dụ: Nếu có 'Khách sạn Continental Saigon' trong danh sách, hãy sử dụng chính xác tên này, không phải 'Khách sạn mẫu'.\n";
        $prompt .= "8. LỊCH TRÌNH CHI TIẾT THEO NGÀY:\n";
        $prompt .= "   - Mỗi ngày chỉ ở 1 khách sạn duy nhất (không đổi khách sạn)\n";
        $prompt .= "   - KHÔNG lặp lại địa điểm trong cùng 1 ngày\n";
        $prompt .= "   - Thời gian đa dạng, không đồng bộ giữa các ngày\n";
        $prompt .= "   - Lịch trình mẫu cho 1 ngày:\n";
        $prompt .= "     * 06:00-07:30: Ăn sáng tại nhà hàng\n";
        $prompt .= "     * 08:00-12:00: Tham quan, đi chơi, giải trí (2-3 hoạt động khác nhau)\n";
        $prompt .= "     * 12:00-13:00: Ăn trưa tại nhà hàng\n";
        $prompt .= "     * 13:00-14:00: Khoảng cách thời gian (không phải event)\n";
        $prompt .= "     * 14:00-18:00: Tham quan, đi chơi, giải trí (2-3 hoạt động khác nhau)\n";
        $prompt .= "     * 19:00-20:00: Ăn tối tại nhà hàng\n";
        $prompt .= "     * 20:00-22:00: Dạo phố, đi bộ, công viên\n";
        $prompt .= "9. GỢI Ý THEO THỜI TIẾT:\n";
        $prompt .= "   - Nếu nắng nóng: Chọn hoạt động mát mẻ, trong nhà, tắm, giải trí trong nhà\n";
        $prompt .= "   - Nếu mát mẻ: Chọn hoạt động ngoài trời, tham quan, dạo phố\n";
        $prompt .= "   - Nếu mưa: Chọn hoạt động trong nhà, bảo tàng, trung tâm thương mại\n";
        $prompt .= "10. CHI PHÍ:\n";
        $prompt .= "    - Nếu người dùng chọn theo ngân sách: Không vượt quá budget\n";
        $prompt .= "    - Nếu không chọn theo ngân sách: Có thể vượt quá budget\n";
        $prompt .= "11. LỌC DỮ LIỆU:\n";
        $prompt .= "    - Chỉ sử dụng địa điểm từ database, không tự tạo tên mới\n";
        $prompt .= "    - Ưu tiên địa điểm phù hợp với thời tiết và thời gian\n";
        $prompt .= "12. Trả về kết quả dưới dạng JSON với cấu trúc:\n";
        $prompt .= "{\n";
        $prompt .= "  \"summary\": {\"total_cost\": number, \"daily_average\": number},\n";
        $prompt .= "  \"days\": [\n";
        $prompt .= "    {\n";
        $prompt .= "      \"day\": number,\n";
        $prompt .= "      \"date\": \"YYYY-MM-DD\",\n";
        $prompt .= "      \"activities\": [\n";
        $prompt .= "        {\n";
        $prompt .= "          \"time\": \"HH:MM\",\n";
        $prompt .= "          \"type\": \"attraction|hotel|restaurant\",\n";
        $prompt .= "          \"name\": \"string\",\n";
        $prompt .= "          \"description\": \"string\",\n";
        $prompt .= "          \"location\": \"string (địa chỉ chi tiết)\",\n";
        $prompt .= "          \"cost\": number,\n";
        $prompt .= "          \"duration\": \"string\"\n";
        $prompt .= "        }\n";
        $prompt .= "      ]\n";
        $prompt .= "    }\n";
        $prompt .= "  ]\n";
        $prompt .= "}\n";

        return $prompt;
    }

    private function callOpenAI($prompt, $startDate = null, $endDate = null)
    {
        $apiKey = config('services.openai.api_key');
        
        if (!$apiKey) {
            // Fallback: Tạo lịch trình mẫu nếu không có API key
            return $this->generateSampleItinerary($prompt, $startDate, $endDate);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Bạn là chuyên gia du lịch Việt Nam, tạo lịch trình chi tiết và thực tế.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 2000,
                'temperature' => 0.7
            ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                
                // Clean content để tránh lỗi encoding
                $content = $this->cleanJsonContent($content);
                
                // Thử decode với nhiều method khác nhau
                $decoded = null;
                $jsonError = null;
                
                // Method 1: Decode bình thường
                $decoded = json_decode($content, true);
                $jsonError = json_last_error();
                
                // Method 2: Nếu lỗi, thử với flags
                if ($jsonError !== JSON_ERROR_NONE) {
                    $decoded = json_decode($content, true, 512, JSON_INVALID_UTF8_IGNORE | JSON_PARTIAL_OUTPUT_ON_ERROR);
                    $jsonError = json_last_error();
                }
                
                // Method 3: Nếu vẫn lỗi, thử extract JSON từ text
                if ($jsonError !== JSON_ERROR_NONE) {
                    // Tìm JSON trong content
                    if (preg_match('/\{.*\}/s', $content, $matches)) {
                        $jsonContent = $matches[0];
                        $decoded = json_decode($jsonContent, true, 512, JSON_INVALID_UTF8_IGNORE);
                        $jsonError = json_last_error();
                    }
                }
                
                // Debug: Log response
                Log::info('OpenAI Response:', [
                    'content' => $content,
                    'decoded' => $decoded,
                    'json_error' => json_last_error_msg()
                ]);
                
                // Kiểm tra nếu JSON decode thất bại
                if ($jsonError !== JSON_ERROR_NONE || $decoded === null) {
                    Log::error('JSON decode failed:', [
                        'content' => $content,
                        'error' => json_last_error_msg()
                    ]);
                    
                    Log::error('JSON decode failed, using sample data');
                    return $this->generateSampleItinerary($prompt, $startDate, $endDate);
                }
                
                return $decoded;
            } else {
                Log::error('OpenAI API Error: ' . $response->body());
                return $this->generateSampleItinerary($prompt, $startDate, $endDate);
            }
        } catch (\Exception $e) {
            Log::error('OpenAI API Exception: ' . $e->getMessage());
            return $this->generateSampleItinerary($prompt, $startDate, $endDate);
        }
    }

    private function generateSampleItinerary($prompt, $startDate = null, $endDate = null)
    {
        // Tạo lịch trình mẫu khi không có OpenAI API
        // Tính số ngày từ start_date và end_date
        if ($startDate && $endDate) {
            $daysCount = Carbon::parse($startDate)->diffInDays($endDate) + 1;
        } else {
            // Parse số ngày từ prompt nếu không có ngày cụ thể
            preg_match('/(\d+)\s*ngày/', $prompt, $matches);
            $daysCount = isset($matches[1]) ? (int)$matches[1] : 3;
        }
        
        // Lấy dữ liệu thực từ database theo destination
        $destination = 'Việt Nam';
        if (preg_match('/(?:đến|tại|ở)\s+([^,\n]+)/', $prompt, $matches)) {
            $destination = trim($matches[1]);
        }
        
        // Lọc theo destination - sử dụng nhiều từ khóa
        $destinationKeywords = [];
        if (stripos($destination, 'hồ chí minh') !== false || stripos($destination, 'sài gòn') !== false) {
            $destinationKeywords = ['Hồ Chí Minh', 'TP.HCM', 'TPHCM', 'Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Tân Bình'];
        } elseif (stripos($destination, 'đà nẵng') !== false) {
            $destinationKeywords = ['Đà Nẵng', 'Hòa Vang', 'Sơn Trà', 'Ngũ Hành Sơn'];
        } elseif (stripos($destination, 'hà nội') !== false) {
            $destinationKeywords = ['Hà Nội', 'Ba Đình', 'Hoàn Kiếm', 'Đống Đa', 'Hai Bà Trưng'];
        } else {
            $destinationKeywords = [$destination];
        }
        
        // Tạo query với OR conditions - lấy nhiều hơn để đảm bảo đủ cho tất cả ngày
        $hotels = \App\Models\Hotel::where(function($query) use ($destinationKeywords) {
            foreach ($destinationKeywords as $keyword) {
                $query->orWhere('address', 'LIKE', '%' . $keyword . '%');
            }
        })->take(50)->get();
        
        $restaurants = \App\Models\Restaurant::where(function($query) use ($destinationKeywords) {
            foreach ($destinationKeywords as $keyword) {
                $query->orWhere('address', 'LIKE', '%' . $keyword . '%');
            }
        })->take(50)->get();
        
        $attractions = \App\Models\CheckinPlace::where(function($query) use ($destinationKeywords) {
            foreach ($destinationKeywords as $keyword) {
                $query->orWhere('address', 'LIKE', '%' . $keyword . '%');
            }
        })->take(50)->get();
        
        // Nếu không tìm thấy, lấy random từ toàn bộ database
        if ($hotels->count() === 0) {
            $hotels = \App\Models\Hotel::take(50)->get();
        }
        if ($restaurants->count() === 0) {
            $restaurants = \App\Models\Restaurant::take(50)->get();
        }
        if ($attractions->count() === 0) {
            $attractions = \App\Models\CheckinPlace::take(50)->get();
        }
        
        // Parse destination từ prompt
        $destination = 'Việt Nam';
        if (preg_match('/(?:đến|tại|ở)\s+([^,\n]+)/', $prompt, $matches)) {
            $destination = trim($matches[1]);
        }
        
        $itinerary = [
            'summary' => [
                'destination' => $destination,
                'total_cost' => 5000000,
                'daily_average' => round(5000000 / $daysCount),
                'days_count' => $daysCount,
                'total_activities' => $daysCount * 3 // Ước tính 3 hoạt động/ngày
            ],
            'days' => []
        ];

        // Theo dõi địa điểm đã sử dụng để tránh lặp lại giữa các ngày
        $usedRestaurantIds = [];
        $usedAttractionIds = [];

        for ($dayIndex = 0; $dayIndex < $daysCount; $dayIndex++) {
            $dayActivities = [];
            
            // Thêm ăn sáng với thời gian đa dạng (không lặp lại giữa các ngày)
            if ($restaurants->count() > 0) {
                $availableRestaurants = $restaurants->whereNotIn('id', $usedRestaurantIds);
                if ($availableRestaurants->count() > 0) {
                    $breakfast = $availableRestaurants->random();
                    $breakfastTimes = ['06:00', '06:30', '07:00'];
                    $dayActivities[] = [
                        'time' => $breakfastTimes[$dayIndex % 3],
                        'type' => 'restaurant',
                        'name' => mb_convert_encoding($breakfast->name, 'UTF-8', 'UTF-8'),
                        'description' => mb_convert_encoding($breakfast->description ?? 'Ăn sáng', 'UTF-8', 'UTF-8'),
                        'cost' => 150000,
                        'duration' => '1.5 giờ',
                        'restaurant_id' => $breakfast->id,
                        'location' => mb_convert_encoding($breakfast->address ?? '', 'UTF-8', 'UTF-8')
                    ];
                    $usedRestaurantIds[] = $breakfast->id;
                }
            }
            
            // Thêm hoạt động buổi sáng với thời gian đa dạng (không lặp lại giữa các ngày)
            if ($attractions->count() > 0) {
                $availableAttractions = $attractions->whereNotIn('id', $usedAttractionIds);
                if ($availableAttractions->count() > 0) {
                    $morningActivity = $availableAttractions->random();
                    $morningTimes = ['08:00', '08:30', '09:00'];
                    $dayActivities[] = [
                        'time' => $morningTimes[$dayIndex % 3],
                        'type' => 'attraction',
                        'name' => mb_convert_encoding($morningActivity->name, 'UTF-8', 'UTF-8'),
                        'description' => mb_convert_encoding($morningActivity->description ?? 'Tham quan buổi sáng', 'UTF-8', 'UTF-8'),
                        'cost' => 200000,
                        'duration' => '2 giờ',
                        'checkin_place_id' => $morningActivity->id,
                        'location' => mb_convert_encoding($morningActivity->address ?? '', 'UTF-8', 'UTF-8')
                    ];
                    $usedAttractionIds[] = $morningActivity->id;
                }
            }
            
            // Thêm hoạt động buổi sáng thứ 2 với thời gian đa dạng (không lặp địa điểm)
            if ($attractions->count() > 1) {
                $availableAttractions = $attractions->whereNotIn('id', $usedAttractionIds);
                if ($availableAttractions->count() > 0) {
                    $morningActivity2 = $availableAttractions->random();
                    $morning2Times = ['10:30', '11:00', '11:30'];
                    $dayActivities[] = [
                        'time' => $morning2Times[$dayIndex % 3],
                        'type' => 'attraction',
                        'name' => mb_convert_encoding($morningActivity2->name, 'UTF-8', 'UTF-8'),
                        'description' => mb_convert_encoding($morningActivity2->description ?? 'Tham quan buổi sáng', 'UTF-8', 'UTF-8'),
                        'cost' => 200000,
                        'duration' => '1.5 giờ',
                        'checkin_place_id' => $morningActivity2->id,
                        'location' => mb_convert_encoding($morningActivity2->address ?? '', 'UTF-8', 'UTF-8')
                    ];
                    $usedAttractionIds[] = $morningActivity2->id;
                }
            }
            
            // Thêm ăn trưa với thời gian đa dạng (không lặp lại giữa các ngày)
            if ($restaurants->count() > 1) {
                $availableRestaurants = $restaurants->whereNotIn('id', $usedRestaurantIds);
                if ($availableRestaurants->count() > 0) {
                    $lunch = $availableRestaurants->random();
                    $lunchTimes = ['12:00', '12:30', '13:00'];
                    $dayActivities[] = [
                        'time' => $lunchTimes[$dayIndex % 3],
                        'type' => 'restaurant',
                        'name' => mb_convert_encoding($lunch->name, 'UTF-8', 'UTF-8'),
                        'description' => mb_convert_encoding($lunch->description ?? 'Ăn trưa', 'UTF-8', 'UTF-8'),
                        'cost' => 250000,
                        'duration' => '1 giờ',
                        'restaurant_id' => $lunch->id,
                        'location' => mb_convert_encoding($lunch->address ?? '', 'UTF-8', 'UTF-8')
                    ];
                    $usedRestaurantIds[] = $lunch->id;
                }
            }
            

            
            // Thêm hoạt động buổi chiều với thời gian đa dạng (không lặp địa điểm)
            if ($attractions->count() > 2) {
                $availableAttractions = $attractions->whereNotIn('id', $usedAttractionIds);
                if ($availableAttractions->count() > 0) {
                    $afternoonActivity = $availableAttractions->random();
                    $afternoonTimes = ['14:00', '14:30', '15:00'];
                    $dayActivities[] = [
                        'time' => $afternoonTimes[$dayIndex % 3],
                        'type' => 'attraction',
                        'name' => mb_convert_encoding($afternoonActivity->name, 'UTF-8', 'UTF-8'),
                        'description' => mb_convert_encoding($afternoonActivity->description ?? 'Tham quan buổi chiều', 'UTF-8', 'UTF-8'),
                        'cost' => 200000,
                        'duration' => '2 giờ',
                        'checkin_place_id' => $afternoonActivity->id,
                        'location' => mb_convert_encoding($afternoonActivity->address ?? '', 'UTF-8', 'UTF-8')
                    ];
                    $usedAttractionIds[] = $afternoonActivity->id;
                }
            }
            
            // Thêm hoạt động buổi chiều thứ 2 với thời gian đa dạng (không lặp địa điểm)
            if ($attractions->count() > 3) {
                $availableAttractions = $attractions->whereNotIn('id', $usedAttractionIds);
                if ($availableAttractions->count() > 0) {
                    $afternoonActivity2 = $availableAttractions->random();
                    $afternoon2Times = ['16:30', '17:00', '17:30'];
                    $dayActivities[] = [
                        'time' => $afternoon2Times[$dayIndex % 3],
                        'type' => 'attraction',
                        'name' => mb_convert_encoding($afternoonActivity2->name, 'UTF-8', 'UTF-8'),
                        'description' => mb_convert_encoding($afternoonActivity2->description ?? 'Tham quan buổi chiều', 'UTF-8', 'UTF-8'),
                        'cost' => 200000,
                        'duration' => '1.5 giờ',
                        'checkin_place_id' => $afternoonActivity2->id,
                        'location' => mb_convert_encoding($afternoonActivity2->address ?? '', 'UTF-8', 'UTF-8')
                    ];
                    $usedAttractionIds[] = $afternoonActivity2->id;
                }
            }
            
            // Thêm ăn tối với thời gian đa dạng (không lặp lại giữa các ngày)
            if ($restaurants->count() > 2) {
                $availableRestaurants = $restaurants->whereNotIn('id', $usedRestaurantIds);
                if ($availableRestaurants->count() > 0) {
                    $dinner = $availableRestaurants->random();
                    $dinnerTimes = ['19:00', '19:30', '20:00'];
                    $dayActivities[] = [
                        'time' => $dinnerTimes[$dayIndex % 3],
                        'type' => 'restaurant',
                        'name' => mb_convert_encoding($dinner->name, 'UTF-8', 'UTF-8'),
                        'description' => mb_convert_encoding($dinner->description ?? 'Ăn tối', 'UTF-8', 'UTF-8'),
                        'cost' => 300000,
                        'duration' => '1 giờ',
                        'restaurant_id' => $dinner->id,
                        'location' => mb_convert_encoding($dinner->address ?? '', 'UTF-8', 'UTF-8')
                    ];
                    $usedRestaurantIds[] = $dinner->id;
                }
            }
            
            // Thêm dạo phố buổi tối với thời gian đa dạng
            $eveningTimes = ['20:00', '20:30', '21:00'];
            $dayActivities[] = [
                'time' => $eveningTimes[$dayIndex % 3],
                'type' => 'activity',
                'name' => 'Dạo phố, đi bộ, công viên',
                'description' => 'Hoạt động buổi tối, dạo phố và thư giãn',
                'cost' => 50000,
                'duration' => '2 giờ',
                'location' => 'Khu vực trung tâm'
            ];
            
            $itinerary['days'][] = [
                'day' => $dayIndex + 1,
                'date' => $startDate ? Carbon::parse($startDate)->addDays($dayIndex)->format('Y-m-d') : Carbon::now()->addDays($dayIndex)->format('Y-m-d'),
                'activities' => $dayActivities
            ];
        }

        return $itinerary;
    }

    private function saveItinerary($validated, $itinerary)
    {
        // Lưu lịch trình vào database
        $userId = Auth::id();
        
        // Tính toán end_date thực tế dựa trên số ngày AI trả về
        $actualDaysCount = isset($itinerary['days']) ? count($itinerary['days']) : 1;
        
        // Đảm bảo không vượt quá số ngày được yêu cầu
        $requestedDaysCount = Carbon::parse($validated['start_date'])->diffInDays($validated['end_date']) + 1;
        $actualDaysCount = min($actualDaysCount, $requestedDaysCount);
        
        $actualEndDate = Carbon::parse($validated['start_date'])->addDays($actualDaysCount - 1)->format('Y-m-d');
        
        // Tạo bản ghi lịch trình chính (Event chính)
        $schedule = \App\Models\Schedule::create([
            'user_id' => $userId,
            'name' => 'Du lịch ' . $validated['destination'],
            'description' => 'Lịch trình được tạo bởi AI dựa trên dữ liệu thực tế',
            'start_date' => $validated['start_date'],
            'end_date' => $actualEndDate, // Sử dụng end_date thực tế
            'budget' => $validated['budget'],
            'travelers' => $validated['travelers'],
            'itinerary_data' => json_encode($itinerary),
            'checkin_place_id' => null, // AI itineraries don't need specific checkin place
            'participants' => $validated['travelers'], // Use travelers as participants
            'status' => 'planning',
            'progress' => 0
        ]);

        // Debug: Log itinerary structure
        Log::info('SaveItinerary Debug:', [
            'itinerary_is_null' => is_null($itinerary),
            'itinerary_type' => gettype($itinerary),
            'has_days' => isset($itinerary['days']),
            'days_count' => isset($itinerary['days']) ? count($itinerary['days']) : 0,
            'itinerary_keys' => is_array($itinerary) ? array_keys($itinerary) : 'not_array'
        ]);
        
        // Kiểm tra nếu itinerary là null hoặc không phải array
        if (is_null($itinerary) || !is_array($itinerary)) {
            Log::error('Invalid itinerary data:', ['itinerary' => $itinerary]);
            throw new \Exception('Invalid itinerary data received from AI');
        }
        
        // Tạo các event con từ dữ liệu AI
        if (isset($itinerary['days']) && is_array($itinerary['days'])) {
            foreach ($itinerary['days'] as $dayIndex => $day) {
                // Chỉ tạo event cho những ngày trong phạm vi hợp lệ
                if ($dayIndex >= $actualDaysCount) {
                    break;
                }
                $currentDate = Carbon::parse($validated['start_date'])->addDays($dayIndex);
                
                if (isset($day['activities']) && is_array($day['activities'])) {
                    foreach ($day['activities'] as $activityIndex => $activity) {
                        // Parse thời gian
                        $startTime = null;
                        $endTime = null;
                        $duration = null;
                        
                        if (isset($activity['time'])) {
                            $startTime = Carbon::parse($activity['time']);
                        }
                        
                        if (isset($activity['duration'])) {
                            // Parse duration từ string (ví dụ: "2 giờ", "30 phút")
                            $durationStr = $activity['duration'];
                            if (preg_match('/(\d+)\s*giờ/', $durationStr, $matches)) {
                                $duration = (int)$matches[1] * 60; // Chuyển thành phút
                            } elseif (preg_match('/(\d+)\s*phút/', $durationStr, $matches)) {
                                $duration = (int)$matches[1];
                            }
                            
                            // Tính end time
                            if ($startTime && $duration) {
                                $endTime = $startTime->copy()->addMinutes($duration);
                            }
                        }
                        
                        // Xác định loại event
                        $type = $this->determineEventType($activity['type'] ?? 'activity');
                        
                        // Tìm foreign key dựa trên tên và loại
                        $checkinPlaceId = null;
                        $hotelId = null;
                        $restaurantId = null;
                        
                        if ($type === 'activity' || $type === 'attraction') {
                            // Tìm trong checkin_places với logic tìm kiếm cải thiện
                            $searchName = $activity['name'];
                            $checkinPlace = \App\Models\CheckinPlace::where(function($query) use ($searchName) {
                                $query->where('name', 'like', '%' . $searchName . '%')
                                      ->orWhere('name', 'like', '%' . str_replace(['Nhà Thờ ', 'Bảo tàng ', 'Chợ ', 'Phố đi bộ '], '', $searchName) . '%')
                                      ->orWhere('name', 'like', '%' . str_replace(['Đức Bà Sài Gòn', 'Đức Bà'], 'Đức Bà', $searchName) . '%')
                                      ->orWhere('name', 'like', '%' . str_replace(['Chứng tích Chiến tranh'], 'Chứng tích Chiến tranh', $searchName) . '%')
                                      ->orWhere('name', 'like', '%' . str_replace(['Bến Nhà Rồng'], 'Nhà Rồng', $searchName) . '%')
                                      ->orWhere('name', 'like', '%' . str_replace(['Dinh Độc Lập'], 'Độc Lập', $searchName) . '%')
                                      ->orWhere('name', 'like', '%' . str_replace(['Landmark 81'], 'Landmark', $searchName) . '%');
                            })->first();
                            if ($checkinPlace) {
                                $checkinPlaceId = $checkinPlace->id;
                            }
                        } elseif ($type === 'hotel') {
                            // Tìm trong hotels với logic tìm kiếm cải thiện
                            $searchName = $activity['name'];
                            $hotel = \App\Models\Hotel::where(function($query) use ($searchName) {
                                $query->where('name', 'like', '%' . $searchName . '%')
                                      ->orWhere('name', 'like', '%' . str_replace(['Khách sạn '], '', $searchName) . '%');
                            })->first();
                            if ($hotel) {
                                $hotelId = $hotel->id;
                            }
                        } elseif ($type === 'restaurant') {
                            // Tìm trong restaurants với logic tìm kiếm cải thiện
                            $searchName = $activity['name'];
                            $restaurant = \App\Models\Restaurant::where(function($query) use ($searchName) {
                                $query->where('name', 'like', '%' . $searchName . '%')
                                      ->orWhere('name', 'like', '%' . str_replace(['Nhà hàng '], '', $searchName) . '%')
                                      ->orWhere('name', 'like', '%' . str_replace(['Quán Ăn Ngon'], 'Ngon', $searchName) . '%')
                                      ->orWhere('name', 'like', '%' . str_replace(['The Deck Saigon'], 'The Deck', $searchName) . '%');
                            })->first();
                            if ($restaurant) {
                                $restaurantId = $restaurant->id;
                            }
                        }
                        
                        // Tạo event con
                        \App\Models\ItineraryEvent::create([
                            'schedule_id' => $schedule->id,
                            'checkin_place_id' => $checkinPlaceId,
                            'hotel_id' => $hotelId,
                            'restaurant_id' => $restaurantId,
                            'title' => $activity['name'] ?? 'Hoạt động ' . ($activityIndex + 1),
                            'description' => $activity['description'] ?? '',
                            'type' => $type,
                            'date' => $currentDate->format('Y-m-d'),
                            'start_time' => $startTime ? $startTime->format('H:i:s') : null,
                            'end_time' => $endTime ? $endTime->format('H:i:s') : null,
                            'duration' => $duration,
                            'cost' => $activity['cost'] ?? 0,
                            'location' => $activity['location'] ?? null,
                            'metadata' => [
                                'original_type' => $activity['type'] ?? 'activity',
                                'day' => $dayIndex + 1,
                                'matched_place_id' => $checkinPlaceId,
                                'matched_hotel_id' => $hotelId,
                                'matched_restaurant_id' => $restaurantId
                            ],
                            'order_index' => $activityIndex
                        ]);
                    }
                }
            }
        }

        return $schedule;
    }

    /**
     * Clean JSON content để tránh lỗi encoding
     */
    private function cleanJsonContent($content)
    {
        // Loại bỏ tất cả ký tự control characters
        $content = preg_replace('/[\x00-\x1F\x7F-\x9F]/', '', $content);
        
        // Fix encoding issues - thử nhiều encoding khác nhau
        $encodings = ['UTF-8', 'ISO-8859-1', 'Windows-1252', 'ASCII'];
        foreach ($encodings as $encoding) {
            $test = mb_convert_encoding($content, 'UTF-8', $encoding);
            if (mb_check_encoding($test, 'UTF-8')) {
                $content = $test;
                break;
            }
        }
        
        // Loại bỏ BOM nếu có
        $content = str_replace("\xEF\xBB\xBF", '', $content);
        
        // Loại bỏ các ký tự đặc biệt có thể gây lỗi JSON
        $content = str_replace(['\n', '\r', '\t'], '', $content);
        
        // Loại bỏ các ký tự Unicode không hợp lệ
        $content = preg_replace('/[\x{FFFD}]/u', '', $content);
        
        // Loại bỏ các ký tự đặc biệt khác - chỉ giữ lại ký tự cơ bản
        $content = preg_replace('/[^\x20-\x7E\xA0-\xFF\x{0100}-\x{017F}\x{0180}-\x{024F}\x{1E00}-\x{1EFF}\x{2C60}-\x{2C7F}\x{A720}-\x{A7FF}\x{AB30}-\x{AB6F}\x{FB00}-\x{FB4F}\x{FF00}-\x{FFEF}]/u', '', $content);
        
        // Thử decode và encode lại để đảm bảo JSON hợp lệ
        $decoded = json_decode($content, true, 512, JSON_INVALID_UTF8_IGNORE | JSON_PARTIAL_OUTPUT_ON_ERROR);
        if ($decoded !== null) {
            $content = json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
        
        return $content;
    }

    /**
     * Xác định loại event từ dữ liệu AI
     */
    private function determineEventType($originalType)
    {
        return match(strtolower($originalType)) {
            'hotel', 'accommodation' => 'hotel',
            'restaurant', 'food', 'dining' => 'restaurant',
            'transport', 'transportation', 'travel' => 'activity', // Chuyển transport thành activity
            'shopping', 'market' => 'activity', // Chuyển shopping thành activity
            'culture', 'museum', 'temple', 'historical' => 'activity', // Chuyển culture thành activity
            'nature', 'park', 'garden' => 'activity', // Chuyển nature thành activity
            'entertainment', 'show', 'performance' => 'activity', // Chuyển entertainment thành activity
            default => 'activity'
        };
    }

    public function getUpgradeInfo()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'vip_benefits' => [
                    'Lịch trình không giới hạn ngày',
                    'Gợi ý AI nâng cao',
                    'Ưu tiên hỗ trợ 24/7',
                    'Truy cập các tính năng premium',
                    'Giảm giá đặc biệt cho dịch vụ du lịch'
                ],
                'pricing' => [
                    'monthly' => 199000,
                    'yearly' => 1990000
                ],
                'contact' => 'support@ipsumtravel.com'
            ]
        ]);
    }

    /**
     * Lấy chi tiết lịch trình với các event con
     */
    public function getItineraryDetail($scheduleId)
    {
        try {
            $schedule = \App\Models\Schedule::with(['itineraryEvents' => function($query) {
                $query->with(['checkinPlace', 'hotel', 'restaurant'])->ordered();
            }])->findOrFail($scheduleId);

            // Kiểm tra quyền truy cập
            if ($schedule->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền truy cập lịch trình này'
                ], 403);
            }

            // Nhóm events theo ngày
            $eventsByDate = [];
            foreach ($schedule->itineraryEvents as $event) {
                $date = $event->date->format('Y-m-d');
                if (!isset($eventsByDate[$date])) {
                    $eventsByDate[$date] = [];
                }
                $eventsByDate[$date][] = [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'type' => $event->type,
                    'icon' => $event->icon,
                    'start_time' => $event->start_time,
                    'end_time' => $event->end_time,
                    'time_display' => $event->time_display,
                    'duration' => $event->duration,
                    'cost' => $event->cost,
                    'cost_display' => $event->cost_display,
                    'location' => $event->location,
                    'metadata' => $event->metadata,
                    'order_index' => $event->order_index,
                    // Thêm thông tin foreign key để biết dữ liệu lấy từ đâu
                    'checkin_place_id' => $event->checkin_place_id,
                    'hotel_id' => $event->hotel_id,
                    'restaurant_id' => $event->restaurant_id,
                    'checkin_place' => $event->checkinPlace ? [
                        'id' => $event->checkinPlace->id,
                        'name' => $event->checkinPlace->name,
                        'address' => $event->checkinPlace->address,
                        'description' => $event->checkinPlace->description
                    ] : null,
                    'hotel' => $event->hotel ? [
                        'id' => $event->hotel->id,
                        'name' => $event->hotel->name,
                        'address' => $event->hotel->address,
                        'description' => $event->hotel->description
                    ] : null,
                    'restaurant' => $event->restaurant ? [
                        'id' => $event->restaurant->id,
                        'name' => $event->restaurant->name,
                        'address' => $event->restaurant->address,
                        'description' => $event->restaurant->description,
                        'rating' => $event->restaurant->rating,
                        'price_range' => $event->restaurant->price_range
                    ] : null
                ];
            }

            // Sắp xếp theo ngày
            ksort($eventsByDate);

            return response()->json([
                'success' => true,
                'data' => [
                    'schedule' => [
                        'id' => $schedule->id,
                        'name' => $schedule->name,
                        'description' => $schedule->description,
                        'start_date' => $schedule->start_date,
                        'end_date' => $schedule->end_date,
                        'duration' => $schedule->duration,
                        'budget' => $schedule->budget,
                        'travelers' => $schedule->travelers,
                        'total_cost' => $schedule->total_cost,
                        'status' => $schedule->status,
                        'progress' => $schedule->progress
                    ],
                    'events_by_date' => $eventsByDate,
                    'summary' => [
                        'total_events' => $schedule->itineraryEvents->count(),
                        'total_days' => count($eventsByDate),
                        'average_cost_per_day' => count($eventsByDate) > 0 ? round($schedule->total_cost / count($eventsByDate)) : 0
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Get Itinerary Detail Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy chi tiết lịch trình'
            ], 500);
        }
    }

    /**
     * Cập nhật event con
     */
    public function updateItineraryEvent(Request $request, $eventId)
    {
        try {
            $event = \App\Models\ItineraryEvent::with('schedule')->findOrFail($eventId);
            
            // Kiểm tra quyền truy cập
            if ($event->schedule->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền chỉnh sửa event này'
                ], 403);
            }

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|nullable|string',
                'start_time' => 'sometimes|nullable|date_format:H:i',
                'end_time' => 'sometimes|nullable|date_format:H:i',
                'duration' => 'sometimes|nullable|integer|min:1',
                'cost' => 'sometimes|numeric|min:0',
                'location' => 'sometimes|nullable|string|max:255',
                'order_index' => 'sometimes|integer|min:0'
            ]);

            $event->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Event đã được cập nhật thành công',
                'data' => $event
            ]);

        } catch (\Exception $e) {
            Log::error('Update Itinerary Event Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật event'
            ], 500);
        }
    }

    /**
     * Xóa event con
     */
    public function deleteItineraryEvent($eventId)
    {
        try {
            $event = \App\Models\ItineraryEvent::with('schedule')->findOrFail($eventId);
            
            // Kiểm tra quyền truy cập
            if ($event->schedule->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền xóa event này'
                ], 403);
            }

            $event->delete();

            return response()->json([
                'success' => true,
                'message' => 'Event đã được xóa thành công'
            ]);

        } catch (\Exception $e) {
            Log::error('Delete Itinerary Event Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi xóa event'
            ], 500);
        }
    }

    /**
     * Lưu lịch trình từ AI vào database
     */
    public function saveItineraryFromAI(Request $request)
    {
        try {
            $itineraryData = $request->all();
            
            // Debug: Log dữ liệu nhận được
            Log::info('SaveItineraryFromAI - Received data:', [
                'summary' => $itineraryData['summary'] ?? 'not_found',
                'days' => isset($itineraryData['days']) ? count($itineraryData['days']) : 'not_found',
                'full_data' => $itineraryData
            ]);
            
            // Validate dữ liệu
            if (!isset($itineraryData['summary']) || !isset($itineraryData['days'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu lịch trình không hợp lệ'
                ], 400);
            }

            // Tạo schedule chính
            $schedule = \App\Models\Schedule::create([
                'user_id' => Auth::id(),
                'name' => 'Du lịch ' . ($itineraryData['summary']['destination'] ?? 'Việt Nam'),
                'start_date' => $itineraryData['summary']['start_date'] ?? now(),
                'end_date' => $itineraryData['summary']['end_date'] ?? now()->addDays(1),
                'budget' => $itineraryData['summary']['total_cost'] ?? 0,
                'participants' => 2, // Giá trị mặc định
                'travelers' => 2, // Giá trị mặc định
                'status' => 'planning', // Giá trị hợp lệ cho enum
                'progress' => 0
            ]);

            // Tạo các event con
            $totalEvents = 0;
            $startDate = \Carbon\Carbon::parse($schedule->start_date);
            
            foreach ($itineraryData['days'] as $dayIndex => $day) {
                if (isset($day['activities'])) {
                    // Tính date cho ngày hiện tại
                    $currentDate = $startDate->copy()->addDays($dayIndex);
                    
                    foreach ($day['activities'] as $activity) {
                        // Lấy ID từ dữ liệu AI hoặc tìm từ database
                        $hotelId = $activity['hotel_id'] ?? null;
                        $restaurantId = $activity['restaurant_id'] ?? null;
                        $checkinPlaceId = $activity['checkin_place_id'] ?? null;
                        
                        $activityType = $this->determineEventType($activity['type'] ?? 'attraction');
                        $activityName = $activity['name'] ?? '';
                        
                        // Nếu không có ID từ AI, tìm từ database theo destination
                        $destination = $itineraryData['summary']['destination'] ?? 'Việt Nam';
                        
                        // Tạo destination keywords
                        $destinationKeywords = [];
                        if (stripos($destination, 'hồ chí minh') !== false || stripos($destination, 'sài gòn') !== false) {
                            $destinationKeywords = ['Hồ Chí Minh', 'TP.HCM', 'TPHCM', 'Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Tân Bình'];
                        } elseif (stripos($destination, 'đà nẵng') !== false) {
                            $destinationKeywords = ['Đà Nẵng', 'Hòa Vang', 'Sơn Trà', 'Ngũ Hành Sơn'];
                        } elseif (stripos($destination, 'hà nội') !== false) {
                            $destinationKeywords = ['Hà Nội', 'Ba Đình', 'Hoàn Kiếm', 'Đống Đa', 'Hai Bà Trưng'];
                        } else {
                            $destinationKeywords = [$destination];
                        }
                        
                        if (!$hotelId && $activityType === 'hotel') {
                            $hotel = \App\Models\Hotel::where('name', 'LIKE', '%' . $activityName . '%')
                                ->where(function($query) use ($destinationKeywords) {
                                    foreach ($destinationKeywords as $keyword) {
                                        $query->orWhere('address', 'LIKE', '%' . $keyword . '%');
                                    }
                                })
                                ->first();
                            if ($hotel) {
                                $hotelId = $hotel->id;
                            }
                        }
                        if (!$restaurantId && $activityType === 'restaurant') {
                            $restaurant = \App\Models\Restaurant::where('name', 'LIKE', '%' . $activityName . '%')
                                ->where(function($query) use ($destinationKeywords) {
                                    foreach ($destinationKeywords as $keyword) {
                                        $query->orWhere('address', 'LIKE', '%' . $keyword . '%');
                                    }
                                })
                                ->first();
                            if ($restaurant) {
                                $restaurantId = $restaurant->id;
                            }
                        }
                        if (!$checkinPlaceId && $activityType === 'activity') {
                            $checkinPlace = \App\Models\CheckinPlace::where('name', 'LIKE', '%' . $activityName . '%')
                                ->where(function($query) use ($destinationKeywords) {
                                    foreach ($destinationKeywords as $keyword) {
                                        $query->orWhere('address', 'LIKE', '%' . $keyword . '%');
                                    }
                                })
                                ->first();
                            if ($checkinPlace) {
                                $checkinPlaceId = $checkinPlace->id;
                            }
                        }
                        
                        \App\Models\ItineraryEvent::create([
                            'schedule_id' => $schedule->id,
                            'checkin_place_id' => $checkinPlaceId,
                            'hotel_id' => $hotelId,
                            'restaurant_id' => $restaurantId,
                            'title' => mb_convert_encoding($activity['name'] ?? 'Hoạt động', 'UTF-8', 'UTF-8'),
                            'description' => mb_convert_encoding($activity['description'] ?? '', 'UTF-8', 'UTF-8'),
                            'start_time' => $activity['time'] ?? '09:00',
                            'end_time' => $this->calculateEndTime($activity['time'] ?? '09:00', $activity['duration'] ?? '1 giờ'),
                            'duration' => $this->parseDuration($activity['duration'] ?? '1 giờ'),
                            'cost' => $activity['cost'] ?? 0,
                            'location' => mb_convert_encoding($activity['location'] ?? '', 'UTF-8', 'UTF-8'),
                            'type' => $activityType,
                            'order_index' => $totalEvents++,
                            'date' => $currentDate->format('Y-m-d')
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Lịch trình đã được lưu thành công',
                'data' => [
                    'schedule_id' => $schedule->id,
                    'total_events' => $totalEvents
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Save Itinerary Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lưu lịch trình'
            ], 500);
        }
    }

    /**
     * Tính thời gian kết thúc dựa trên thời gian bắt đầu và thời lượng
     */
    private function calculateEndTime($startTime, $duration)
    {
        $start = \Carbon\Carbon::createFromFormat('H:i', $startTime);
        $hours = $this->parseDuration($duration);
        return $start->addHours($hours)->format('H:i');
    }

    /**
     * Parse thời lượng từ string sang số giờ
     */
    private function parseDuration($duration)
    {
        if (is_numeric($duration)) {
            return (int)$duration;
        }
        
        // Parse các format như "1 giờ", "2 giờ", "1.5 giờ"
        if (preg_match('/(\d+(?:\.\d+)?)\s*giờ/', $duration, $matches)) {
            return (float)$matches[1];
        }
        
        // Parse các format như "1h", "2h", "1.5h"
        if (preg_match('/(\d+(?:\.\d+)?)\s*h/', $duration, $matches)) {
            return (float)$matches[1];
        }
        
        return 1; // Default 1 giờ
    }

}
