# Cấu hình OpenAI API cho IPSUM Travel AI

## 1. Lấy OpenAI API Key

1. Truy cập https://platform.openai.com/
2. Đăng ký/Đăng nhập tài khoản
3. Vào "API Keys" trong menu
4. Tạo API Key mới
5. Copy API Key

## 2. Cấu hình trong file .env

Thêm dòng sau vào file `backend/.env`:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## 3. Kiểm tra cấu hình

Sau khi thêm API Key, AI sẽ:
- ✅ Trả lời thông minh hơn với GPT-3.5-turbo
- ✅ Tạo lịch trình chi tiết và thực tế
- ✅ Mở form AI Model khi người dùng yêu cầu gợi ý có tỉnh thành
- ✅ Tích hợp dữ liệu từ database
- ✅ Trả lời câu hỏi về địa điểm du lịch chính xác

## 4. Test AI

1. Mở chat AI (icon tròn góc phải)
2. Hỏi: "AI là ai?"
3. Yêu cầu: "Gợi ý lịch trình Đà Nẵng"
4. Hỏi: "Núi Bà du lịch được ko"
5. Kiểm tra xem form AI Model có mở không

## 5. Troubleshooting

Nếu AI không hoạt động:
- Kiểm tra API Key trong .env
- Kiểm tra log trong `storage/logs/laravel.log`
- Đảm bảo backend đang chạy: `php artisan serve`
- Kiểm tra kết nối internet

## 6. Fallback

Nếu không có OpenAI API Key, AI sẽ sử dụng dữ liệu mẫu từ database để tạo lịch trình.

## 7. Các tính năng mới

- **Intent Analysis**: Phân tích ý định người dùng
- **Location Recognition**: Nhận diện địa điểm từ câu hỏi
- **Smart Responses**: Trả lời thông minh dựa trên context
- **Form Integration**: Tự động mở form khi có yêu cầu lịch trình
- **OpenAI Integration**: Sử dụng GPT-3.5-turbo cho câu trả lời chất lượng cao
