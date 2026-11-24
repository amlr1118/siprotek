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
        Schema::create('hierarki_niosh_models', function (Blueprint $table) {
            $table->id();
            $table->integer('urutan_efektivitas');
            $table->string('nama_hierarki');
            $table->string('deskripsi_kendali');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hierarki_niosh_models');
    }
};
