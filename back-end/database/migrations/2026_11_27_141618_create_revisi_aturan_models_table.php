<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use function Laravel\Prompts\table;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('revisi_aturan_models', function (Blueprint $table) {
            $table->id();
            // $table->unsignedBigInteger('id_aturan');
            // $table->unsignedBigInteger('id_pengguna');
            // $table->
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('revisi_aturan_models');
    }
};
