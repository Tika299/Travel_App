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
        //
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('address');
            $table->decimal('latitude', 10, 7)->index();
            $table->decimal('longitude', 11, 7)->index();
            $table->integer('checkin_count')->default(0);
            $table->decimal('rating', 2, 1)->nullable()->index();
            $table->boolean('has_fee')->default(false);
            $table->string('category')->nullable(); // Phân loại địa điểm
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
