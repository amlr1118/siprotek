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
        Schema::create('penilaian_resiko_models', function (Blueprint $table) {
            $table->id();
            $table->string('kode_penilaian');
            $table->unsignedBigInteger('id_pengguna');
            $table->unsignedBigInteger('id_unit');
            $table->dateTime('waktu_penilaian');
            $table->integer('jumlah_aturan_menyala');
            $table->unsignedBigInteger('id_resiko_tertinggi');
            $table->json('ringkasan_dimensi');
            $table->boolean('status_peringatan_dini')->default(false);
            $table->string('catatan_lapangan')->nullable();
            $table->timestamps();


            $table->foreign('id_resiko_tertinggi')
                ->references('id')
                ->on('kategori_resiko_models')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('id_unit')
                ->references('id')
                ->on('unit_kerja_models')
                ->onUpdate('cascade')
                ->onDelete('cascade');

             $table->foreign('id_pengguna')
                ->references('id')
                ->on('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penilaian_resiko_models');
    }
};
