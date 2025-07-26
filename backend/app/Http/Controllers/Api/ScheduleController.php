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
    public function index()
    {
        return Schedule::with(['user', 'checkinPlace'])->get();
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

        // Lấy loại lọc từ request
        $filterType = $request->filterType ?? 'general';
        
        // Tạo prompt với yêu cầu hiển thị tất cả bằng tiếng Việt
        $enhancedPrompt = "Bạn là trợ lý tạo lịch trình du lịch. Hãy tạo lịch trình bằng tiếng Việt hoàn toàn:\n\n" .
            "QUY TẮC QUAN TRỌNG:\n" .
            "- Tất cả nội dung phải viết bằng tiếng Việt\n" .
            "- Field 'title': Viết hoạt động bằng tiếng Việt (KHÔNG viết 'Ngày 1:', 'Ngày 2:')\n" .
            "- Field 'location': Viết địa chỉ chi tiết đầy đủ (ví dụ: 'Dinh Độc Lập, 135 Nam Kỳ Khởi Nghĩa, Quận 1, TP. Hồ Chí Minh')\n" .
            "- Field 'description': Viết mô tả chi tiết bằng tiếng Việt, KHÔNG BAO GỒM thông tin thời tiết và chi phí (vì đã có field riêng)\n" .
            "- Field 'start': Thời gian bắt đầu (format: YYYY-MM-DDTHH:MM:SS)\n" .
            "- Field 'end': Thời gian kết thúc (format: YYYY-MM-DDTHH:MM:SS)\n" .
            "- Field 'cost': Chi phí dự kiến (ví dụ: 'Miễn phí', '50.000 VND', '200.000 VND')\n" .
            "- Field 'weather': Thông tin thời tiết (ví dụ: 'Nắng đẹp, 28°C', 'Mưa nhẹ, 25°C')\n\n" .
            "Format JSON bắt buộc:\n" .
            "[\n" .
            "  {\n" .
            "    \"title\": \"Tham quan Dinh Độc Lập\",\n" .
            "    \"start\": \"2025-07-25T09:00:00\",\n" .
            "    \"end\": \"2025-07-25T11:00:00\",\n" .
            "    \"location\": \"Dinh Độc Lập, 135 Nam Kỳ Khởi Nghĩa, Quận 1, TP. Hồ Chí Minh\",\n" .
            "    \"description\": \"Tìm hiểu về lịch sử phong phú và di sản văn hóa Việt Nam. Khám phá kiến trúc độc đáo và các hiện vật lịch sử quan trọng.\",\n" .
            "    \"cost\": \"40.000 VND\",\n" .
            "    \"weather\": \"Nắng đẹp, 30°C\"\n" .
            "  }\n" .
            "]\n\n" .
            "Yêu cầu của người dùng: " . $request->prompt . "\n\n" .
            "Hãy tạo lịch trình chi tiết, đa dạng hoạt động, phù hợp với thời gian và địa điểm. Tất cả phải viết bằng tiếng Việt. KHÔNG viết 'Ngày 1:', 'Ngày 2:' trong title. QUAN TRỌNG: \n" .
            "1. Trong field 'location' phải viết địa chỉ chi tiết đầy đủ bao gồm tên địa điểm, số nhà, đường, quận/huyện, thành phố.\n" .
            "2. Trong field 'description' chỉ viết mô tả hoạt động, KHÔNG bao gồm thông tin thời tiết và chi phí.\n" .
            "3. Field 'cost' phải ghi rõ chi phí (Miễn phí hoặc giá cụ thể).\n" .
            "4. Field 'weather' phải ghi thông tin thời tiết dự kiến.\n" .
            "5. Nếu có ngân sách, hãy phân bổ chi phí hợp lý để không vượt quá ngân sách.\n\n" .
            "LOẠI LỌC: " . $filterType . "\n" .
            "- weather_only: Chỉ hiển thị thông tin thời tiết, KHÔNG hiển thị chi phí\n" .
            "- budget_only: Chỉ hiển thị thông tin chi phí, KHÔNG hiển thị thời tiết\n" .
            "- both: Hiển thị cả thời tiết và chi phí\n" .
            "- general: Hiển thị đầy đủ thông tin";

        // Gọi OpenAI API (GPT-3.5 Turbo)
        $openaiRes = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                ['role' => 'user', 'content' => $enhancedPrompt]
            ],
            'max_tokens' => 1500,
            'temperature' => 0.7,
        ]);
        $result = $openaiRes->json();
        \Log::info('OpenAI raw result:', [$result]); // Log toàn bộ response OpenAI
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
        }
        \Log::info('Final aiEvents:', [$aiEvents]); // Log kết quả cuối cùng

        // Thêm filterType vào mỗi event
        if (is_array($aiEvents)) {
            foreach ($aiEvents as &$event) {
                $event['filterType'] = $filterType;
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
