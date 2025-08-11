# Hướng dẫn cấu hình chia sẻ Social Media

## Vấn đề hiện tại
- Chia sẻ đang chạy trên `localhost:5173` nên Facebook không thể truy cập được
- Cần thay đổi domain để chia sẻ hoạt động đúng

## Cách khắc phục

### 1. Cập nhật domain trong config
Mở file `src/config/siteConfig.js` và thay đổi:

```javascript
const siteConfig = {
  // Thay đổi domain này khi deploy lên production
  domain: process.env.NODE_ENV === 'production' 
    ? 'https://your-actual-domain.com'  // ← Thay đổi domain thật ở đây
    : 'http://localhost:5173',
  
  // API URL
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://your-api-domain.com'     // ← Thay đổi API domain thật ở đây
    : 'http://localhost:8000',
  // ...
};
```

### 2. Các domain cần thay đổi:
- **Frontend domain**: `https://your-actual-domain.com` (domain chính của website)
- **API domain**: `https://your-api-domain.com` (domain của backend API)

### 3. Ví dụ cấu hình thật:
```javascript
const siteConfig = {
  domain: process.env.NODE_ENV === 'production' 
    ? 'https://travel-app.vercel.app'  // hoặc domain thật của bạn
    : 'http://localhost:5173',
  
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://travel-app-api.herokuapp.com'  // hoặc API domain thật
    : 'http://localhost:8000',
  // ...
};
```

### 4. Kiểm tra sau khi cấu hình:
1. Deploy lên production
2. Mở trang chi tiết món ăn
3. Nhấn nút "Chia sẻ" → Facebook
4. Kiểm tra xem Facebook có hiển thị đúng ảnh và tiêu đề không

### 5. Lưu ý quan trọng:
- **Facebook chỉ có thể truy cập URL public**, không thể truy cập localhost
- **Meta tags phải được cập nhật đúng** với domain thật
- **Ảnh phải có URL public** (không phải localhost)
- **Cần clear Facebook cache** sau khi thay đổi meta tags

### 6. Debug Facebook Sharing:
- Sử dụng [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- Nhập URL thật vào debugger để kiểm tra meta tags
- Clear cache nếu cần thiết

## Cấu trúc URL chia sẻ:
```
https://your-domain.com/cuisine/123
```

Thay vì:
```
http://localhost:5173/cuisine/123
```
