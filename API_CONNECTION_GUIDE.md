# Hướng dẫn kết nối API Frontend - Backend

## Cấu trúc dự án

### Backend (Laravel)
- **API Routes**: `backend/routes/api.php`
- **Controllers**: `backend/app/Http/Controllers/Api/`
  - `CuisineController.php` - Quản lý món ăn
  - `CategoryController.php` - Quản lý danh mục
- **Models**: `backend/app/Models/`
  - `Cuisine.php` - Model món ăn
  - `Category.php` - Model danh mục
- **Resources**: `backend/app/Http/Resources/`
  - `CuisineResource.php` - Format dữ liệu món ăn
  - `CategoryResource.php` - Format dữ liệu danh mục

### Frontend (React)
- **API Config**: `frontend/src/services/api.js`
- **Services**: `frontend/src/services/`
  - `cuisineService.js` - Service gọi API món ăn
  - `categoryService.js` - Service gọi API danh mục
- **Components**: `frontend/src/pages/`
  - `Cuisine.jsx` - Trang hiển thị món ăn (đã kết nối API)
  - `ApiTest.jsx` - Trang test kết nối API

## Các API Endpoints

### Categories API
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/{id}` - Lấy danh mục theo ID
- `POST /api/categories` - Tạo danh mục mới
- `PUT /api/categories/{id}` - Cập nhật danh mục
- `DELETE /api/categories/{id}` - Xóa danh mục

### Cuisines API
- `GET /api/cuisines` - Lấy danh sách món ăn
- `GET /api/cuisines/{id}` - Lấy món ăn theo ID
- `POST /api/cuisines` - Tạo món ăn mới
- `PUT /api/cuisines/{id}` - Cập nhật món ăn
- `DELETE /api/cuisines/{id}` - Xóa món ăn

### Query Parameters cho Cuisines
- `category_id` - Lọc theo danh mục
- `region` - Lọc theo miền (Miền Bắc, Miền Trung, Miền Nam)
- `search` - Tìm kiếm theo tên hoặc mô tả
- `per_page` - Số lượng item mỗi trang (mặc định: 15)

## Cách chạy và test

### 1. Khởi động Backend
```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

### 2. Chạy migrations và seeders
```bash
cd backend
php artisan migrate:fresh --seed
```

### 3. Khởi động Frontend
```bash
cd frontend
npm run dev
```

### 4. Test API
- Truy cập: `http://localhost:5173/api-test` để test kết nối API
- Truy cập: `http://localhost:5173/cuisine` để xem trang ẩm thực với dữ liệu từ API

## Cấu hình CORS

Nếu gặp lỗi CORS, thêm vào file `backend/config/cors.php`:

```php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:5173'],
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => false,
```

## Dữ liệu mẫu

Sau khi chạy seeder, sẽ có:
- 8 danh mục món ăn (Phở, Bún, Cơm, Bánh mì, Lẩu, Gỏi, Hải sản, Món chay)
- 50 món ăn mẫu với thông tin đầy đủ

## Troubleshooting

### Lỗi thường gặp:
1. **CORS Error**: Kiểm tra cấu hình CORS trong backend
2. **Database Error**: Chạy lại migrations và seeders
3. **API không response**: Kiểm tra backend có đang chạy không
4. **Port conflict**: Đổi port trong `api.js` nếu cần

### Debug:
- Mở Developer Tools (F12) để xem console logs
- Kiểm tra Network tab để xem API calls
- Sử dụng trang `/api-test` để test kết nối 