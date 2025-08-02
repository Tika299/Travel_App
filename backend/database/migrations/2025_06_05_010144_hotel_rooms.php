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
        Schema::create('hotel_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained()->onDelete('cascade');
            $table->string('room_type', 50);
            $table->decimal('price_per_night', 10, 2);
            $table->string('description');
            $table->decimal('room_area', 8, 2)->nullable()->comment('Room area in square meters');
            $table->string('bed_type', 50)->nullable()->comment('E.g., King, Queen, Twin, Double');
            $table->unsignedTinyInteger('max_occupancy')->default(2)->comment('Maximum number of people');
            $table->json('images')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotel_rooms');
    }
};
