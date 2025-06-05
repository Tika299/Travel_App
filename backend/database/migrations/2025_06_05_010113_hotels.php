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
        Schema::create('hotels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('address');
            $table->decimal('latitude', 10, 7)->index();
            $table->decimal('longitude', 11, 7)->index();
            $table->decimal('rating', 2, 1)->nullable()->index(); // Tối ưu rating từ 1.0 đến 5.0
            $table->string('contact_info')->nullable(); // Thêm thông tin liên hệ
            $table->boolean('wheelchair_access')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};
