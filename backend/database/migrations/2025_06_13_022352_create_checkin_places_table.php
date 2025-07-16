<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkin_places', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('image')->nullable();
            $table->float('rating')->default(0);
            $table->unsignedBigInteger('location_id')->nullable();
            $table->decimal('price', 15, 2)->nullable();
            $table->boolean('is_free')->default(false);
            $table->json('operating_hours')->nullable();
            $table->bigInteger('checkin_count')->default(0);
            $table->bigInteger('review_count')->default(0);
            $table->json('images')->nullable();
            $table->string('region')->nullable();
            $table->text('caption')->nullable();
            $table->decimal('distance', 8, 2)->nullable(); // Thêm trường distance
            $table->json('transport_options')->nullable();
            $table->enum('status', ['active', 'inactive', 'draft'])->default('active');

            $table->timestamps();

            $table->foreign('location_id')
                ->references('id')
                ->on('locations')
                ->onDelete('set null');
            $table->foreign('location_id')
                ->references('id')
                ->on('locations')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkin_places');
        Schema::dropIfExists('checkin_places');
    }
};

