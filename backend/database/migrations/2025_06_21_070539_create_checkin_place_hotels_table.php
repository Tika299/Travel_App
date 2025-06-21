<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('checkin_place_hotels', function (Blueprint $table) {
            $table->id();

            $table->foreignId('checkin_place_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('hotel_id'); // KHÔNG gán foreign key vì bạn không quản lý bảng hotels

            $table->string('note')->nullable(); // Ghi chú nếu cần
            $table->decimal('distance_km', 5, 2)->nullable(); // Khoảng cách đến địa điểm
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkin_place_hotels');
    }
};
