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
            $table->string('contact_info');
            $table->string('address');
            $table->decimal('latitude', 10, 7)->index();
            $table->decimal('longitude', 11, 7)->index();
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->json('operating_hours')->nullable();
            $table->decimal('rating', 2, 1)->nullable()->index();
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
