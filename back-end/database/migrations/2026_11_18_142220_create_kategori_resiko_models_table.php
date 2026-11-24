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
        Schema::create('kategori_resiko_models', function (Blueprint $table) {
            $table->id();
            $table->string('level_reisko')->unique();
            $table->integer('bobot_prioritas');
            $table->string('makna_resiko');
            $table->string('prioritas_respon');
            $table->string('kode_warna');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kategori_resiko_models');
    }
};
