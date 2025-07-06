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
            $table->foreignId('transportation_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('contact_info')->nullable();
            $table->string('address');
            $table->decimal('latitude', 10, 7)->index();
            $table->decimal('longitude', 11, 7)->index();
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->json('operating_hours')->nullable(); // Ví dụ: {"Monday": "24/7", "Tuesday": "24/7", ...}
            $table->decimal('rating', 2, 1)->nullable()->index();
            $table->json('price_range')->nullable(); // Ví dụ: {"base_km": 12000, "additional_km": 14000, "waiting_hour": 3000}
            $table->string('phone_number')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->json('payment_methods')->nullable(); // Ví dụ: ["cash", "bank_card", "xe_om", "bao_kim"]
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