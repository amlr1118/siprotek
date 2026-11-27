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
        Schema::create('detail_input_fakta_models', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_penilaian');
            $table->unsignedBigInteger('id_aturan');
            $table->boolean('kondisi_if_terpilih')->default(false);
            $table->boolean('kondisi_and_terpilih');
            $table->string('status_kecocokan');
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
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_input_fakta_models');
    }
};
