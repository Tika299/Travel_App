<?php

use Illuminate\Database\Migrations\Migration; // Import class Migration
use Illuminate\Database\Schema\Blueprint; // Import class Blueprint
use Illuminate\Support\Facades\Schema; // Import Schema facade

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkin_places', function (Blueprint $table) { // Tạo bảng checkin_places
            $table->id(); // Khóa chính tự tăng
            $table->string('name'); // Tên địa điểm
            $table->text('description')->nullable(); // Mô tả (có thể null)
            $table->string('address')->nullable(); // Địa chỉ (có thể null)
            $table->decimal('latitude', 10, 7)->nullable(); // Tọa độ vĩ độ (có thể null)
            $table->decimal('longitude', 10, 7)->nullable(); // Tọa độ kinh độ (có thể null)
            $table->string('image')->nullable(); // Ảnh đại diện (có thể null)
            $table->float('rating')->default(0); // Đánh giá trung bình (mặc định 0)
            $table->unsignedBigInteger('location_id')->nullable(); // Khóa ngoại liên kết đến bảng locations (có thể null)
            $table->decimal('price', 15, 2)->nullable(); // Giá vé (có thể null)
            $table->json('operating_hours')->nullable(); // Thời gian hoạt động (JSON, có thể null)
            $table->bigInteger('checkin_count')->default(0); // Số lượt check-in (mặc định 0)
            $table->bigInteger('review_count')->default(0); // Số đánh giá (mặc định 0)
            $table->json('images')->nullable(); // Danh sách ảnh (JSON, có thể null)
            $table->string('region')->nullable(); // Miền (Bắc, Trung, Nam, có thể null)
            $table->text('caption')->nullable(); // Chú thích (ví dụ: "Thành phố ngàn năm văn hiến...", có thể null)
            $table->integer('distance')->nullable(); // Khoảng cách (phút hoặc km, có thể null)
            $table->json('transport_options')->nullable(); // Phương tiện di chuyển (JSON, ví dụ: ["bus", "taxi"], có thể null)
            $table->timestamps(); // Cột created_at và updated_at

            $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null'); // Khóa ngoại liên kết đến bảng locations, xóa mềm khi xóa
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkin_places'); // Xóa bảng nếu tồn tại
    }
};