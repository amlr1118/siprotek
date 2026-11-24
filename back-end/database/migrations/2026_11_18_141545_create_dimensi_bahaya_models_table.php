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
        Schema::create('dimensi_bahaya_models', function (Blueprint $table) {
            $table->id();
            $table->string('kode_dimensi')->unique();
            $table->string('nama_dimensi');
            $table->string('deskripsi_indikator');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dimensi_bahaya_models');
    }
};
