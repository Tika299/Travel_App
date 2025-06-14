<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('checkin_places', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // tên địa điểm
            $table->text('description')->nullable(); // mô tả
            $table->string('address')->nullable(); // địa chỉ
            $table->decimal('latitude', 10, 7)->nullable(); // tọa độ vĩ độ
            $table->decimal('longitude', 10, 7)->nullable(); // tọa độ kinh độ
            $table->string('image')->nullable(); // ảnh đại diện
            $table->float('rating')->default(0); // đánh giá trung bình
            $table->unsignedBigInteger('location_id')->nullable(); // khóa ngoại liên kết đến bảng locations
            $table->timestamps();

            $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkin_places');
    }
};
