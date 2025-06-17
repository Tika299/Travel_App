<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCategoriesTable extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id(); // id tự động tăng
            $table->string('nam'); // nếu đây là năm có thể dùng string hoặc integer tùy bạn
            $table->string('ten');
            $table->string('icon')->nullable();
            $table->string('type')->nullable();
            $table->timestamps(); // created_at và updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
}
