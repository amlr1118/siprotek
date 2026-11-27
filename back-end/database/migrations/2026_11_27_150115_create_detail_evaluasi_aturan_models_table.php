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
        Schema::create('detail_evaluasi_aturan_models', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_penilaian');
            $table->unsignedBigInteger('id_aturan');
            $table->unsignedBigInteger('id_kategori_resiko');
            $table->string('status_mitigasi');
            $table->string('catatan_tindak_lanjut')->nullable();
            $table->timestamps();


            $table->foreign('id_penilaian')
                ->references('id')
                ->on('penilaian_resiko_models')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('id_aturan')
                ->references('id')
                ->on('aturan_k3_models')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('id_kategori_resiko')
                ->references('id')
                ->on('kategori_resiko_models')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_evaluasi_aturan_models');
    }
};
