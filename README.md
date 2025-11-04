# Travel App – Ứng dụng Du lịch Thông minh

## Giới thiệu
**Travel App** là một ứng dụng du lịch thông minh giúp người dùng **lập kế hoạch du lịch cá nhân hóa**.  
Sau khi đăng ký và đăng nhập, người dùng có thể:
- Chọn điểm đến.
- Nhận gợi ý địa điểm **check-in**, **ăn uống**, **lưu trú** hiển thị trên **Google Maps**.
- Tham gia tính năng xã hội như **chia sẻ ảnh**, **bình luận**, **thích bài viết**.
- Lên **lịch trình tự động**, nhận **email nhắc nhở** hoạt động.

Ứng dụng được phát triển bằng **ReactJS (Frontend)** và **Laravel (Backend)**, triển khai trong môi trường **Docker**, quản lý mã nguồn với **Git** và **GitHub**.

---

## Công nghệ sử dụng

| Thành phần         | Công nghệ              |
|--------------------|------------------------|
| Frontend           | ReactJS, TailwindCSS   |
| Backend            | Laravel                |
| Cơ sở dữ liệu      | MySQL                  |
| Triển khai         | Docker                 |
| Quản lý mã nguồn   | Git, GitHub            |
| Bản đồ & API       | Google Maps API        |
| Email              | Laravel Mail           |

---

## Chức năng chính

### a. Đăng ký và đăng nhập
- Người dùng đăng ký tài khoản với **email, mật khẩu và thông tin cơ bản**.
- Sau khi đăng nhập, có thể truy cập toàn bộ tính năng ứng dụng.
- Phân loại người dùng dựa trên hoạt động:
  - **Người mới** – ít hoạt động, mới tham gia.
  - **Lã Ca** – hoạt động trung bình, có một số bài viết/đánh giá.
  - **Du Mục** – hoạt động tích cực, nhiều bài viết/đánh giá.

---

### b. Chọn điểm du lịch
- Hiển thị danh sách các **tỉnh/thành phố hoặc khu vực** du lịch.
- Người dùng chọn một điểm để xem gợi ý:
  - Điểm check-in (có phí / miễn phí)
  - Món ăn đặc sản và quán ăn nổi bật
  - Nơi lưu trú (Homestay / Khách sạn)

---

### c. Gợi ý địa điểm

#### Điểm check-in
- Phân loại:
  - Có phí: Bảo tàng, công viên giải trí, khu du lịch.
  - Miễn phí: Công viên công cộng, bãi biển, quảng trường.
- Sắp xếp **theo đánh giá cao nhất**.
- Hiển thị vị trí trên **Google Maps** kèm chi tiết.

#### Ăn uống
- Gợi ý **món đặc sản** của địa điểm du lịch.
- Hiển thị danh sách quán ăn phục vụ món đó:
  - Đánh giá.
  - Khoảng giá.
  - Vị trí bản đồ (Google Maps marker).

#### Khách sạn
- Phân loại:
  - **Homestay** – nhà dân, thân thiện, giá rẻ.
  - **Khách sạn** – dịch vụ chuyên nghiệp, đa dạng.
- Hiển thị:
  - Đánh giá.
  - Mức giá.
  - Thông tin liên hệ (số điện thoại, email, website).
- Hiển thị vị trí trên Google Maps.

---

### d. Tính năng xã hội
- Người dùng **chia sẻ ảnh trải nghiệm** tại địa điểm.
- Ảnh **không tải lên máy chủ**, chỉ chia sẻ qua liên kết hoặc MXH.
- Có thể:
  - Bình luận.
  - Thích bài viết.
  - Chia sẻ lên Facebook, Instagram, v.v.
- Mỗi bài viết liên kết với **địa điểm cụ thể** (check-in, quán ăn hoặc khách sạn).

---

### e. Lên lịch trình
- Người dùng chọn:
  - **Số ngày du lịch**.
  - **Nơi lưu trú** (khách sạn/homestay).
- Hệ thống tự động tạo lịch trình chi tiết từng ngày gồm:
  - Điểm check-in (có phí hoặc miễn phí).
  - Quán ăn phục vụ món đặc sản.
  - Giờ nhận phòng (check-in) & trả phòng (check-out).
- Cho phép người dùng **chỉnh sửa thủ công** lịch trình.
- Gửi **email nhắc nhở trước mỗi hoạt động**:
  - Người dùng có thể xác nhận, từ chối hoặc chỉnh sửa hoạt động.
  - Nếu từ chối, hệ thống hỏi có muốn chỉnh sửa lịch trình không:
    - Nếu không → hủy hoạt động.
    - Nếu có → cho phép chỉnh sửa.

---

## Hướng dẫn chạy dự án

### Clone code từ nhánh master
```bash
git clone -b master https://github.com/<ten-tai-khoan>/<ten-repo>.git
```

### Cài đặt và chạy Frontend (ReactJS)
```bash
cd frontend
npm install
npm run dev
```

Ứng dụng frontend sẽ chạy tại: **http://localhost:5173**

### Cài đặt và chạy Backend (Laravel)
```bash
cd backend
composer install
php artisan serve
```

API backend chạy tại: **http://localhost:8000**

### (Tuỳ chọn) Chạy bằng Docker
```bash
docker-compose up -d
```

Docker sẽ khởi tạo container cho frontend, backend, và database.

---

## Cấu trúc dự án
```
TravelApp/
│
├── frontend/              # Giao diện ReactJS
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/               # API Laravel
│   ├── app/
│   ├── routes/
│   ├── database/
│   ├── composer.json
│   └── .env.example
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## Nhóm phát triển

| Họ và tên          | Vai trò                          | Công nghệ phụ trách              |
|--------------------|----------------------------------|----------------------------------|
| Lê Xuân Vũ         | Trưởng nhóm, Developer           | Laravel, ReactJS, Docker, Python |
| Lê Hồng Sơn        | Dev                              | Laravel, ReactJS                 |
| Nguyễn Văn Đài     | Dev                              | Laravel, ReactJS                 |
| Đỗ Đức Anh         | Designer                         | Canva, Photoshop                 |
| Nguyễn Danh Phát   | Dev                              | Laravel, ReactJS                 |
| Lê Văn Vũ          | Dev                              | Laravel, ReactJS                 |
| Nguyễn Đình Vũ Kha | Dev                              | Laravel, ReactJS                 |
| Lê Thanh Bình      | Dev Analysis                     | Python                           |
| Võ Như Quỳnh       | Tester                           | Laravel, ReactJS                 |
| Võ Tân Khoa        | Dev Analysis                     | Python                           |

---

## Liên hệ
- **Email**: contact@travelapp.vn
- **Website**: https://travelapp.vn

---

© 2025 Travel App – Đề án học phần.  
Ứng dụng được phát triển nhằm mục đích học tập và nghiên cứu.
