<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        return Schedule::with(['user', 'checkinPlace'])
            ->where('user_id', $user->id)
            ->get();
    }

    /**
     * Get or create default schedule for current user
     */
    public function getOrCreateDefault(Request $request)
    {
        // Tạm thời hardcode user_id = 1 cho testing
        $userId = 1;
        
        // Tìm schedule mặc định
        $schedule = Schedule::where('user_id', $userId)
            ->where('name', 'Lịch trình mặc định')
            ->first();
        
        // Nếu chưa có, tạo mới
        if (!$schedule) {
            $schedule = Schedule::create([
                'name' => 'Lịch trình mặc định',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(30)->toDateString(),
                'checkin_place_id' => 1, // Tạm thời hardcode
                'participants' => 1,
                'description' => 'Lịch trình mặc định cho testing',
                'budget' => 0,
                'status' => 'planning',
                'progress' => 0,
                'user_id' => $userId,
            ]);
        }
        
        return response()->json($schedule);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'checkin_place_id' => 'required|exists:checkin_places,id',
            'participants' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'status' => 'required|in:upcoming,completed,planning',
            'progress' => 'required|integer|min:0|max:100',
            'user_id' => 'required|exists:users,id',
        ]);
        $schedule = Schedule::create($validated);
        return response()->json($schedule, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $schedule = Schedule::with(['user', 'checkinPlace'])->findOrFail($id);
        return response()->json($schedule);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $schedule = Schedule::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'checkin_place_id' => 'sometimes|required|exists:checkin_places,id',
            'participants' => 'sometimes|required|integer|min:1',
            'description' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'status' => 'sometimes|required|in:upcoming,completed,planning',
            'progress' => 'sometimes|required|integer|min:0|max:100',
            'user_id' => 'sometimes|required|exists:users,id',
        ]);
        $schedule->update($validated);
        return response()->json($schedule);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $schedule = Schedule::findOrFail($id);
        $schedule->delete();
        return response()->json(null, 204);
    }

    /**
     * Gợi ý lịch trình bằng AI và lưu vào schedules
     */
    public function aiSuggestSchedule(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string',
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'checkin_place_id' => 'required|exists:checkin_places,id',
            'participants' => 'required|integer|min:1',
            'user_id' => 'required|exists:users,id',
            'budget' => 'nullable|numeric',
            'filterType' => 'nullable|string|in:weather_only,budget_only,both,general',
        ]);

        // Kiểm tra giới hạn số ngày (tối đa 30 ngày)
        $startDate = \Carbon\Carbon::parse($request->start_date);
        $endDate = \Carbon\Carbon::parse($request->end_date);
        $daysDiff = $startDate->diffInDays($endDate) + 1;
        
        if ($daysDiff > 30) {
            return response()->json([
                'error' => 'Lịch trình quá dài. Vui lòng chọn thời gian tối đa 30 ngày.',
                'max_days' => 30,
                'current_days' => $daysDiff
            ], 400);
        }

        // Lấy loại lọc từ request
        $filterType = $request->filterType ?? 'general';
        
        // Tạo prompt cải thiện với logic thời gian và địa lý
        $enhancedPrompt = "Tạo lịch trình du lịch " . $daysDiff . " ngày bằng tiếng Việt cho địa điểm: " . $request->prompt . "\n\n" .
            "QUY TẮC QUAN TRỌNG:\n" .
            "1. THỜI GIAN HỢP LÝ:\n" .
            "   - SÁNG (8h-12h): Tham quan di tích, bảo tàng, công viên\n" .
            "   - CHIỀU (13h-17h): Mua sắm, ẩm thực, tham quan tiếp\n" .
            "   - TỐI (18h-22h): Ăn tối, giải trí, đi dạo phố\n" .
            "2. KHOẢNG CÁCH ĐỊA LÝ:\n" .
            "   - Chỉ gợi ý địa điểm trong cùng thành phố/tỉnh\n" .
            "   - Không đi từ Hà Nội xuống HCM trong 1 ngày\n" .
            "   - Ưu tiên địa điểm gần nhau trong cùng buổi\n" .
            "3. ĐA DẠNG HOẠT ĐỘNG:\n" .
            "   - Tham quan di tích, bảo tàng\n" .
            "   - Ẩm thực địa phương\n" .
            "   - Mua sắm, giải trí\n" .
            "   - Thư giãn, đi dạo\n\n" .
            "TẠO CHO TẤT CẢ " . $daysDiff . " NGÀY, mỗi ngày 2-3 hoạt động.\n\n" .
            "Format JSON:\n" .
            "[{\"title\":\"Tên hoạt động bằng tiếng Việt\",\"start\":\"2025-07-25T09:00:00\",\"end\":\"2025-07-25T11:00:00\",\"location\":\"Địa chỉ cụ thể bằng tiếng Việt\",\"description\":\"Mô tả chi tiết\",\"cost\":\"50.000 VND\",\"weather\":\"Nắng 30°C\"}]";

        // Gọi OpenAI API (GPT-3.5 Turbo)
        $openaiRes = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-3.5-turbo-16k', // Sử dụng model có context window lớn hơn
            'messages' => [
                ['role' => 'user', 'content' => $enhancedPrompt]
            ],
            'max_tokens' => 4000, // Giảm xuống để phù hợp với model
            'temperature' => 0.7,
        ]);
        $result = $openaiRes->json();
        \Log::info('OpenAI raw result:', [$result]); // Log toàn bộ response OpenAI
        
        // Kiểm tra lỗi API
        if (isset($result['error'])) {
            \Log::error('OpenAI API Error:', $result['error']);
            return response()->json([
                'error' => 'Lỗi AI API: ' . ($result['error']['message'] ?? 'Unknown error'),
                'details' => $result['error']
            ], 500);
        }
        
        $aiEvents = [];
        if (!empty($result['choices'][0]['message']['content'])) {
            $content = $result['choices'][0]['message']['content'];
            \Log::info('OpenAI content:', [$content]); // Thêm log nội dung AI trả về
            
            // Thử extract JSON array từ text nếu có
            if (preg_match('/\[.*\]/s', $content, $matches)) {
                $aiEvents = json_decode($matches[0], true);
                \Log::info('Extracted JSON array:', [$aiEvents]); // Log JSON array đã extract
            } else {
                $aiEvents = json_decode($content, true);
                \Log::info('Direct JSON decode:', [$aiEvents]); // Log JSON decode trực tiếp
            }
            
            // Kiểm tra JSON decode có thành công không
            if (json_last_error() !== JSON_ERROR_NONE) {
                \Log::error('JSON decode error:', [json_last_error_msg(), 'Content:', $content]);
                return response()->json([
                    'error' => 'AI trả về dữ liệu không hợp lệ: ' . json_last_error_msg(),
                    'raw_content' => $content
                ], 500);
            }
        } else {
            \Log::error('OpenAI returned empty content');
            return response()->json([
                'error' => 'AI không trả về nội dung',
                'result' => $result
            ], 500);
        }
        
        \Log::info('Final aiEvents count:', [count($aiEvents)]); // Log số lượng sự kiện

        // Nếu AI không tạo được sự kiện, tạo sự kiện mẫu
        if (empty($aiEvents) || !is_array($aiEvents)) {
            \Log::warning('AI không tạo được sự kiện, tạo sự kiện mẫu');
            $aiEvents = [];
            
            // Tạo sự kiện mẫu cho 3 ngày đầu
            $startDate = \Carbon\Carbon::parse($request->start_date);
            for ($day = 0; $day < min(3, $daysDiff); $day++) {
                $currentDate = $startDate->copy()->addDays($day);
                
                // Sự kiện sáng (8h-12h)
                $aiEvents[] = [
                    'title' => 'Tham quan di tích nổi tiếng',
                    'start' => $currentDate->copy()->setTime(8, 0)->format('Y-m-d\TH:i:s'),
                    'end' => $currentDate->copy()->setTime(12, 0)->format('Y-m-d\TH:i:s'),
                    'location' => 'Di tích lịch sử, ' . $request->prompt,
                    'description' => 'Khám phá di tích lịch sử và tìm hiểu văn hóa địa phương',
                    'cost' => '100.000 VND',
                    'weather' => 'Nắng đẹp, 28°C',
                    'filterType' => $filterType
                ];
                
                // Sự kiện chiều (13h-17h)
                $aiEvents[] = [
                    'title' => 'Ăn trưa và mua sắm',
                    'start' => $currentDate->copy()->setTime(13, 0)->format('Y-m-d\TH:i:s'),
                    'end' => $currentDate->copy()->setTime(17, 0)->format('Y-m-d\TH:i:s'),
                    'location' => 'Khu mua sắm và nhà hàng, ' . $request->prompt,
                    'description' => 'Thưởng thức ẩm thực địa phương và mua sắm đồ lưu niệm',
                    'cost' => '200.000 VND',
                    'weather' => 'Nắng đẹp, 28°C',
                    'filterType' => $filterType
                ];
                
                // Sự kiện tối (18h-22h)
                $aiEvents[] = [
                    'title' => 'Ăn tối và đi dạo phố',
                    'start' => $currentDate->copy()->setTime(18, 0)->format('Y-m-d\TH:i:s'),
                    'end' => $currentDate->copy()->setTime(22, 0)->format('Y-m-d\TH:i:s'),
                    'location' => 'Phố đi bộ và nhà hàng, ' . $request->prompt,
                    'description' => 'Thưởng thức bữa tối và đi dạo khám phá phố phường về đêm',
                    'cost' => '150.000 VND',
                    'weather' => 'Mát mẻ, 25°C',
                    'filterType' => $filterType
                ];
            }
        } else {
            // Thêm filterType vào mỗi event
            foreach ($aiEvents as &$event) {
                $event['filterType'] = $filterType;
            }
        }
        
        // Nếu AI tạo ít sự kiện hơn mong đợi, thử tạo thêm
        $expectedEvents = $daysDiff * 2; // Mỗi ngày ít nhất 2 hoạt động
        if (is_array($aiEvents) && count($aiEvents) < $expectedEvents && count($aiEvents) > 0) {
            \Log::info('AI tạo ít sự kiện hơn mong đợi. Số sự kiện: ' . count($aiEvents) . ', Mong đợi: ' . $expectedEvents);
            
            // Tạo thêm sự kiện cho các ngày còn thiếu
            $additionalPrompt = "Tạo thêm lịch trình cho các ngày còn lại. Chỉ tạo JSON array với các sự kiện mới:\n" .
                "Yêu cầu: " . $request->prompt . "\n" .
                "Tạo thêm cho " . ($daysDiff - ceil(count($aiEvents) / 2)) . " ngày còn lại.\n" .
                "Format: [{\"title\":\"Hoạt động\",\"start\":\"YYYY-MM-DDTHH:MM:SS\",\"end\":\"YYYY-MM-DDTHH:MM:SS\",\"location\":\"Địa chỉ\",\"description\":\"Mô tả\",\"cost\":\"Chi phí\",\"weather\":\"Thời tiết\"}]";
            
            $additionalRes = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo-16k',
                'messages' => [
                    ['role' => 'user', 'content' => $additionalPrompt]
                ],
                'max_tokens' => 3000, // Giảm token cho request thêm
                'temperature' => 0.7,
            ]);
            
            $additionalResult = $additionalRes->json();
            if (!empty($additionalResult['choices'][0]['message']['content'])) {
                $additionalContent = $additionalResult['choices'][0]['message']['content'];
                if (preg_match('/\[.*\]/s', $additionalContent, $matches)) {
                    $additionalEvents = json_decode($matches[0], true);
                    if (is_array($additionalEvents)) {
                        foreach ($additionalEvents as &$event) {
                            $event['filterType'] = $filterType;
                        }
                        $aiEvents = array_merge($aiEvents, $additionalEvents);
                        \Log::info('Đã thêm ' . count($additionalEvents) . ' sự kiện. Tổng: ' . count($aiEvents));
                    }
                }
            }
        }

        // Lưu lịch trình vào DB
        $schedule = Schedule::create([
            'name' => $request->name,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'checkin_place_id' => $request->checkin_place_id,
            'participants' => $request->participants,
            'description' => 'Lịch trình AI gợi ý (OpenAI)',
            'budget' => $request->budget,
            'status' => 'planning',
            'progress' => 0,
            'user_id' => $request->user_id,
        ]);

        return response()->json([
            'schedule' => $schedule,
            'ai_events' => $aiEvents,
        ], 201);
    }
}
