<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transport_companies', function (Blueprint $table) {
            $table->id();
            // Liên kết loại phương tiện
            $table->foreignId('transportation_id')->constrained()->onDelete('cascade');
            // Thông tin cơ bản
            $table->string('name');
            $table->string('short_description', 255)->nullable(); // Giới thiệu ngắn
            $table->text('description')->nullable();              // Mô tả chi tiết
            // Vị trí
            $table->string('address');
            $table->decimal('latitude', 10, 7)->index();
            $table->decimal('longitude', 11, 7)->index();
            $table->unsignedBigInteger('province_id')->nullable()->index(); // Gắn tỉnh/thành
            // Ảnh đại diện
            $table->string('logo')->nullable();
            // Hoạt động
            $table->json('operating_hours')->nullable(); 
            $table->decimal('rating', 2, 1)->nullable()->index();
            // Giá cước
            $table->json('price_range')->nullable(); // {"base_km": 12000, "additional_km": 14000, "waiting_minute_fee": 3000}
            // Liên hệ
            $table->string('phone_number')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            // Thanh toán & Dịch vụ
            $table->json('payment_methods')->nullable(); // ["cash", "bank_card", "momo"]
            $table->boolean('has_mobile_app')->default(false); // ✅ Có app
            $table->json('highlight_services')->nullable(); // ✅ ["insurance", "7_chair"]
            $table->string('contact_response_time')->nullable(); // ✅ ví dụ: "5-10 phút"
            // Trạng thái
            $table->enum('status', ['active', 'inactive', 'draft'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transport_companies');
    }
};

