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
        Schema::create('aturan_k3_models', function (Blueprint $table) {
            $table->id();
            $table->string('kode_rule')->unique();
            $table->string('kelompok_aturan');
            $table->unsignedBigInteger('id_dimensi');
            $table->unsignedBigInteger('id_unit');
            $table->string('kondisi_if');
            $table->string('operator_logika');
            $table->string('kondisi_and');
            $table->string('tindakan_then');
            $table->string('tingkat_keparahan');
            $table->string('tingkat_kemungkinan');
            $table->unsignedBigInteger('id_kategori_resiko');
            $table->unsignedBigInteger('id_hierarki');
            $table->string('rekomendasi_mitigasi');
            $table->string('basis_temuan_tahap1');
            $table->boolean('status_aturan')->default(false);
            $table->timestamps();

            $table->foreign('id_dimensi')
                ->references('id')
                ->on('dimensi_bahaya_models')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('id_unit')
                ->references('id')
                ->on('unit_kerja_models')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('id_kategori_resiko')
                ->references('id')
                ->on('kategori_resiko_models')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('id_hierarki')
                ->references('id')
                ->on('hierarki_niosh_models')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });



    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aturan_k3_models');
    }
};
